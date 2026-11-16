import { createMemo, createResource, type Accessor } from "solid-js";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import type { CardStore } from "#/src/contexts/CardContext";
import type { AnkiNote } from "#/src/lib/types";
import { type Store, unwrap } from "solid-js/store";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { parseRelatedExpression } from "#/src/lib/parse-related-expression";
import { useWorker } from "./worker";

export function useCardQuery({
  $initialSide,
  $card,
}: {
  $initialSide: Accessor<CardStore["side"]>;
  $card: Store<CardStore>;
}) {
  const { aborter, logger } = useGeneralContext();
  const { initialAnkiFields: ankiFields } = useAnkiFieldContext();
  const { getWorker } = useWorker();

  const $expression = createMemo(() => ankiFields.Expression);
  const $expressionReading = createMemo(() => ankiFields.ExpressionReading);
  const $isFront = createMemo(() => $initialSide() === "front");
  const $readingList = createMemo(() => {
    if ($isFront() || !ankiFields.ExpressionReading) return [];
    return [ankiFields.ExpressionReading];
  });
  const $relatedExpressions = createMemo(() => {
    if ($isFront()) return [];
    return parseRelatedExpression(ankiFields.RelatedExpression);
  });
  const $expressionList = createMemo(() => {
    return [...(ankiFields.Expression ? [ankiFields.Expression] : []), ...$relatedExpressions()];
  });

  const [$$card] = createResource(
    () => {
      if (!$card.ready) return undefined;
      return {
        isFront: $isFront(),
        expression: $expression(),
        expressionReading: $expressionReading(),
        readingList: $readingList(),
        relatedExpressions: $relatedExpressions(),
        expressionList: $expressionList(),
      };
    },
    async ({
      isFront,
      expression,
      expressionReading,
      readingList,
      relatedExpressions,
      expressionList,
    }) => {
      const workerApi = await getWorker();
      if (aborter.signal.aborted) return;

      const { readingResult, expressionResult, newNotes, isNotesCache } =
        await workerApi.queryShared({
          readingList,
          ankiFields: unwrap(ankiFields),
          expressionList,
        });
      if (aborter.signal.aborted) return;

      const thisExpressionResults = expressionResult[expression] ?? [];
      const sameExpression = thisExpressionResults.filter(
        (n) => n.fields.Expression.value === expression,
      );

      let sameReading: AnkiNote[] = [];
      let relatedExpression: AnkiNote[] = [];

      if (!isFront) {
        sameReading = readingResult[expressionReading] ?? [];

        const incomingRelated = thisExpressionResults.filter(
          (n) => n.fields.Expression.value !== expression,
        );
        const outgoingRelated = relatedExpressions.flatMap((e) => expressionResult[e] ?? []);
        const combinedRelated = [...incomingRelated, ...outgoingRelated];
        relatedExpression = Array.from(new Map(combinedRelated.map((n) => [n.noteId, n])).values());
      }

      logger.debug(
        `[query] results for "${expression}": source=${isNotesCache ? "cache" : "ankiConnect"}, ` +
          `reading=${sameReading.length}, sameExpr=${sameExpression.length}, ` +
          `related=${relatedExpression.length}`,
      );

      return { sameReading, sameExpression, relatedExpression, newNotes, isNotesCache };
    },
  );

  return { $$card };
}

export type $$Card = ReturnType<typeof useCardQuery>["$$card"];
