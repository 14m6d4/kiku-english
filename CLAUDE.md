# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Kiku English is an Anki note type for English sentence mining (Yomitan + asbplayer). It is a hard fork of upstream Kiku (`youyoumu/kiku`, remote `upstream`) with the Japanese-only code deleted, not disabled. We do not merge from upstream; fixes are cherry-picked by hand. See `docs/adr/0001-hard-fork-and-delete-japanese-code.md` and use the vocabulary in `GLOSSARY.md`.

## Commands

pnpm + Turborepo monorepo, Node >= 24. Run from the root unless noted.

- `pnpm typecheck` / `pnpm test` / `pnpm lint` / `pnpm format` (oxlint + oxfmt; `lint:fix`, `format:fix` to apply)
- Single test file (in `packages/note`): `pnpm vitest run src/lib/text.test.ts`; single test: add `-t "<name>"`
- `cd packages/note && pnpm dev`: Vite dev server on :5173 serving `preview/anki/index.html`, which mimics Anki's webview. Switch sides with `?side=front#` / `?side=back#`; example field values come from `src/lib/examples.ts`.
- `cd packages/note && pnpm apply`: build, generate templates, copy files into Anki's `collection.media`, and update the `Kiku English` note type through AnkiConnect. Needs Anki open with AnkiConnect, no editor/browser window. `apply:fast` skips tsc and dts.

Scripts that touch Anki read `packages/note/.env` (`ANKI_USER`, default `User 1`, or `ANKI_COLLECTION_MEDIA_PATH`) and fail if the media path does not exist (skipped when `CI=true`).

## Architecture

`packages/note` is the only package. Upstream's docs site and Kiku Note Manager addon were deleted, not forked (see the ADR).

### The card is a SolidJS app shipped as Anki media

- `vite build` emits an ES library into `dist/` split into fixed chunks (see `vite.config.ts`): `_kikuen.js` (entry, `src/index.tsx`), `_kikuen_libs.js` (node_modules), `_kikuen_shared.js` (`src/lib`, `src/hooks`, `src/contexts`), `_kikuen_lazy.js` (`src/lazy`, loaded after first paint), `_kikuen_worker.js` (`src/worker`, AnkiConnect calls and related-notes work off the main thread) and `_kikuen.css`. Moving a module between those folders moves it between chunks.
- `template/front.html` / `back.html` / `style.css` are the Anki card templates. `script/generate-template.ts` fills their placeholders (`__VERSION__`, `<!-- SSR_TEMPLATE -->`, the hydration script) into `.anki-build/`, prerendering the card with Solid SSR (`script/generate-ssr-template.tsx`) so the first paint needs no JS; `src/index.tsx` then hydrates inside the `<kikuen-host-anki>` custom element's shadow root.
- `src/lazy/lib/template.ts` duplicates the host/root markup of `front.html` and `back.html` (used when Settings rewrites the templates); `template.test.ts` fails if they drift, so edit both together.
- Theme and a few settings (`__DATA_THEME__`, `__DATA_BLUR_NSFW__`, CSS variables in `style.css`) are baked into the templates to avoid a flash before JS runs. Everything else lives in `_kikuen_config.json` in `collection.media`; `src/lib/config.ts` validates each key against `src/lib/default-config.ts`, so a new setting needs both.
- State is passed through Solid contexts in `src/contexts`; Anki field values arrive via `AnkiFieldsContext`, and the field list is `ankiFieldsSkeleton` in `src/lib/types.ts`.

### Plugins

Users customise the card through `_kikuen_plugin.js` / `_kikuen_plugin.css` in `collection.media` (starting from the empty stubs in `template/`). `src/hooks/plugin.ts` imports it at runtime and calls its hooks with a `ctx` of Solid primitives and contexts, typed in `plugins/plugin-types.ts`. The folders under `plugins/` are examples; `pnpm plugin:symlink <name>` / `plugin:copy <name>` installs one into Anki.

### Coexisting with upstream

Both note types can live in one Anki collection, so every runtime name must differ from upstream's: media files and globals use `_kikuen`/`kikuen` (never `_kiku`), the custom element is `kikuen-host-anki`, storage keys are `kikuen-*` (`src/lib/contants.ts`), and AnkiConnect queries filter on note type `Kiku English`.

## Agent skills

### Issue tracker

GitHub Issues on the fork `14m6d4/kiku-english` (never upstream `youyoumu/kiku`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` + `docs/adr/`. See `docs/agents/domain.md`.
