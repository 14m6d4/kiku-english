import { Show } from "solid-js";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useCardContext } from "#/src/contexts/CardContext";

export function Expression() {
  const { $ankiFields } = useAnkiFieldContext();
  const { $initialSide } = useCardContext();
  return (
    <>
      {$ankiFields.Expression}
      {/* On the front the reading stays hidden until the expression is hovered. */}
      <Show when={$initialSide() === "front" && $ankiFields.ExpressionReading}>
        <div class="font-primary text-base sm:text-lg leading-normal text-base-content-calm opacity-0 transition-opacity [.expression:hover_&]:opacity-100">
          {$ankiFields.ExpressionReading}
        </div>
      </Show>
    </>
  );
}
