import { Show } from "solid-js";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useCardContext } from "#/src/contexts/CardContext";

export function Expression() {
  const { $ankiFields } = useAnkiFieldContext();
  const { $initialSide } = useCardContext();
  return (
    <>
      {$ankiFields.Expression}
      {/* On the front the reading stays hidden until the box is hovered. The
          wrapper has no height, so the expression stays centred. */}
      <Show when={$initialSide() === "front" && $ankiFields.ExpressionReading}>
        <div class="h-0 flex justify-center whitespace-nowrap">
          <div class="reading font-primary pt-2 sm:pt-4 text-base-content-calm opacity-0 transition-opacity duration-300 [.expression-audio-box:hover_&]:opacity-100">
            {$ankiFields.ExpressionReading}
          </div>
        </div>
      </Show>
    </>
  );
}
