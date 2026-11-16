import "#/src/lib/polyfill";
import { ipaKey } from "#/src/lib/ipa-key";
import type { KikuConfig } from "#/src/lib/config";
import type { Constants } from "#/src/lib/contants";
import { parseRelatedExpression } from "#/src/lib/parse-related-expression";
import type { AnkiFields, AnkiNote, KikuNotesManifest } from "#/src/lib/types";

import { AnkiConnect } from "./AnkiConnect";
import { type NexRemote } from "./nex";
import type { MainThreadApi } from "./MainThreadApi";

export class WorkerThreadApi {
  main!: NexRemote<MainThreadApi>;
  assetsPath!: string;
  constants!: Constants;
  config!: KikuConfig;
  preferAnkiConnect!: boolean;
  cache = new Map();
  ankiConnect!: AnkiConnect;
  private readonly log = {
    trace: (...args: unknown[]) => this.main.log("trace", args),
    debug: (...args: unknown[]) => this.main.log("debug", args),
    info: (...args: unknown[]) => this.main.log("info", args),
    warn: (...args: unknown[]) => this.main.log("warn", args),
    error: (...args: unknown[]) => this.main.log("error", args),
  };

  init(payload: {
    assetsPath: string;
    constants: Constants;
    config: KikuConfig;
    preferAnkiConnect: boolean;
  }): void {
    this.assetsPath = payload.assetsPath;
    this.constants = payload.constants;
    this.config = payload.config;
    this.preferAnkiConnect = payload.preferAnkiConnect;
    this.ankiConnect = new AnkiConnect(this.main.fetchJson, this.config.ankiConnectAddress);
  }

  chunkCache = new Map<string, AnkiNote[]>();
  async query({
    readingList,
    expressionList,
    withNewNotes = true,
  }: {
    readingList: string[];
    expressionList: string[];
    withNewNotes?: boolean;
  }) {
    const queryWithNotesCache = async () => {
      const readingListResult: Record<string, AnkiNote[]> = {};
      const expressionListResult: Record<string, AnkiNote[]> = {};
      const newNotes: AnkiNote[] = [];

      const manifest = await this.notesManifest();

      const readingSet = new Set(readingList);
      const expressionSet = new Set(expressionList);

      await Promise.all(
        manifest.chunks.map(async (chunk) => {
          if (this.chunkCache.has(chunk.file)) return;
          const buf = await this.main.fetchArrayBuffer(`${this.assetsPath}/${chunk.file}`);
          const text = await gunzipArrayBuffer(buf).text();
          this.chunkCache.set(chunk.file, JSON.parse(text) as AnkiNote[]);
        }),
      );

      for (const chunk of manifest.chunks) {
        const notes = this.chunkCache.get(chunk.file);
        if (!notes) continue;

        for (const note of notes) {
          if (note.modelName !== "Kiku English") continue;

          const expr = note.fields.Expression.value;
          const reading = ipaKey(note.fields.ExpressionReading?.value);
          const relatedExprValue = note.fields.RelatedExpression?.value ?? "";

          // ------- Reading Search (exact) -------
          if (readingSet.has(reading)) {
            readingListResult[reading] ??= [];
            readingListResult[reading].push(note);
          }

          // ------- Expression Search (exact) -------
          if (expressionSet.has(expr)) {
            expressionListResult[expr] ??= [];
            expressionListResult[expr].push(note);
          }

          // ------- Related Expression Search (contains) -------
          if (relatedExprValue) {
            const relatedExprs = parseRelatedExpression(relatedExprValue);
            for (const rel of relatedExprs) {
              if (expressionSet.has(rel)) {
                expressionListResult[rel] ??= [];
                if (!expressionListResult[rel].includes(note)) {
                  expressionListResult[rel].push(note);
                }
              }
            }
          }
        }
      }

      return {
        readingListResult,
        expressionListResult,
        newNotes,
      };
    };

    let result: {
      readingListResult: Record<string, AnkiNote[]>;
      expressionListResult: Record<string, AnkiNote[]>;
      newNotes: AnkiNote[];
    };
    let isNotesCache: boolean;

    if (this.preferAnkiConnect) {
      try {
        void this.log.info("Querying with AnkiConnect");
        result = await this.ankiConnect.queryFieldContains({
          readingList,
          expressionList,
          withNewNotes,
        });
        isNotesCache = false;
      } catch {
        void this.log.warn("Failed to query with AnkiConnect, falling back to notes cache");
        result = await queryWithNotesCache();
        isNotesCache = true;
      }
    } else {
      try {
        void this.log.info("Querying with notes cache");
        result = await queryWithNotesCache();
        isNotesCache = true;
      } catch {
        void this.log.warn("Failed to query with notes cache, falling back to AnkiConnect");
        result = await this.ankiConnect.queryFieldContains({
          readingList,
          expressionList,
          withNewNotes,
        });
        isNotesCache = false;
      }
    }

    const sort = (res: Record<string, AnkiNote[]>) => {
      for (const key in res) {
        res[key].sort((a, b) => b.noteId - a.noteId);
      }
    };

    sort(result.readingListResult);
    sort(result.expressionListResult);

    return { ...result, isNotesCache };
  }
  debounceTimer: ReturnType<typeof setTimeout> | null = null;
  debounceMs = 200;
  async queryShared({
    readingList,
    expressionList,
    ankiFields,
    withNewNotes = true,
  }: {
    readingList?: string[];
    expressionList?: string[];
    ankiFields: AnkiFields;
    withNewNotes?: boolean;
  }) {
    return new Promise<{
      readingResult: Record<string, AnkiNote[]>;
      expressionResult: Record<string, AnkiNote[]>;
      newNotes: AnkiNote[];
      isNotesCache: boolean;
    }>((resolve, reject) => {
      this.pendingQueryShared.push({
        readingList: readingList ?? [],
        expressionList: expressionList ?? [],
        ankiFields,
        withNewNotes,
        resolve,
      });
      if (this.debounceTimer) clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(() => {
        this.actualQueryShared().catch((e) => {
          reject(e);
        });
      }, this.debounceMs);
    });
  }

  pendingQueryShared: {
    readingList: string[];
    expressionList: string[];
    ankiFields: AnkiFields;
    withNewNotes: boolean;
    resolve: (v: {
      readingResult: Record<string, AnkiNote[]>;
      expressionResult: Record<string, AnkiNote[]>;
      newNotes: AnkiNote[];
      isNotesCache: boolean;
    }) => void;
  }[] = [];

  async actualQueryShared() {
    const requests = this.pendingQueryShared;
    this.pendingQueryShared = [];

    const batchedReadingList = [...new Set(requests.flatMap((r) => r.readingList))];
    const batchedExpressionList = [...new Set(requests.flatMap((r) => r.expressionList))];
    const needsNewNotes = requests.some((r) => r.withNewNotes);

    const { readingListResult, expressionListResult, newNotes, isNotesCache } = await this.query({
      readingList: batchedReadingList,
      expressionList: batchedExpressionList,
      withNewNotes: needsNewNotes,
    });

    for (const req of requests) {
      const { readingList, expressionList, ankiFields } = req;

      const filterSameNote = (note: AnkiNote) => {
        if (note.cards.includes(Number(ankiFields.CardID))) return false;
        return true;
      };
      const filterSameExpression = (note: AnkiNote) => {
        return note.fields.Expression.value !== ankiFields.Expression;
      };

      // --- reading ---
      const readingResult: Record<string, AnkiNote[]> = {};
      for (const reading of readingList) {
        readingResult[reading] =
          readingListResult[reading]?.filter(filterSameNote).filter(filterSameExpression) ?? [];
      }

      // --- expression ---
      const expressionResult: Record<string, AnkiNote[]> = {};
      for (const expression of expressionList) {
        expressionResult[expression] =
          expressionListResult[expression]?.filter(filterSameNote) ?? [];
      }

      req.resolve({
        readingResult,
        expressionResult,
        newNotes,
        isNotesCache,
      });
    }
  }

  async notesManifest(): Promise<KikuNotesManifest> {
    const key = this.notesManifest.name;
    if (this.cache.has(key)) return this.cache.get(key);
    let manifest: KikuNotesManifest;
    try {
      manifest = (await this.main.fetchJson(
        `${this.assetsPath}/${this.constants.assets["_kikuen_notes_manifest.json"]}`,
        { cache: "no-store" },
      )) as KikuNotesManifest;
    } catch {
      throw new Error("Failed to load manifest");
    }
    this.cache.set(key, manifest);
    return manifest;
  }
}

function gunzipArrayBuffer(buf: ArrayBuffer) {
  if (buf.byteLength === 0) {
    throw new Error("No body for empty buffer");
  }
  const res = new Response(buf);
  if (!res.body) {
    throw new Error("No body for buffer");
  }
  const ds = new DecompressionStream("gzip");
  const decompressed = res.body.pipeThrough(ds);
  return new Response(decompressed);
}
