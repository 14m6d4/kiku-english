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
        <div class="reading font-primary mt-2 sm:mt-4 min-h-lh text-base-content-calm opacity-0 transition-opacity duration-300 [.expression-audio-box:hover_&]:opacity-100">
          {$ankiFields.ExpressionReading}
        </div>
      </Show>
    </>
  );
}
