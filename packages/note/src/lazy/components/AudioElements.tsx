import { createEffect, createMemo, For, on, onMount, Show } from "solid-js";
import { useCardContext } from "#/src/contexts/CardContext";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useConfigContext } from "#/src/contexts/ConfigContext";
import { useFieldGroupContext } from "#/src/contexts/FieldGroupContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { AnkiConnect } from "#/src/lib/anki-connect";

function AudioTag(props: { text: string }) {
  // Find all `[sound:filename.mp3]` occurrences
  const $matches = createMemo(() => [...props.text.matchAll(/\[sound:([^\]]+)\]/g)]);
  const $sounds = createMemo(() => $matches().map((m) => m[1]));

  return (
    <Show when={$sounds().length > 0}>
      <div class="flex flex-wrap gap-2">
        <For each={$sounds()}>
          {(src) => {
            return <audio src={src} preload="none" />;
          }}
        </For>
      </div>
    </Show>
  );
}

export function AudioElements() {
  const { $ankiFields, $isRootAnkiFields } = useAnkiFieldContext();
  const { $card, $setCard, nested } = useCardContext();
  const { $group, $index } = useFieldGroupContext();
  const { $config } = useConfigContext();
  const { logger, aborter, isAnkiDroidOldStudyScreen } = useGeneralContext();
  const hiddenStyle = {
    width: "0",
    height: "0",
    overflow: "hidden",
    position: "absolute",
  } as const;

  createEffect(
    on(
      () => $group().sentenceAudioField,
      () => {
        const anchors = $card.sentenceAudioRef?.querySelectorAll("a");
        const audios = $card.sentenceAudioRef?.querySelectorAll("audio");
        logger.debug("[AudioElements] sentenceAudioRef scan:", {
          anchors: anchors?.length ?? 0,
          audios: audios?.length ?? 0,
        });
        if (anchors?.length) {
          $setCard("sentenceAudios", Array.from(anchors));
        }
        if (audios?.length) {
          $setCard("sentenceAudios", Array.from(audios));
        }
        if (!anchors?.length && !audios?.length) {
          $setCard("sentenceAudios", undefined);
        }
      },
    ),
  );

  let autoPlay = true;
  createEffect(
    on(
      () => $group().sentenceAudioField,
      () => {
        if (nested && autoPlay) {
          autoPlay = false;
          const audio = $card.expressionAudioRef?.querySelector("audio");
          if (audio) {
            logger.info("[AudioElements] autoPlay: expression");
            void audio.play();
            audio.onpause = () => {
              const audio = $card.sentenceAudioRef?.querySelectorAll("audio")[0];
              if (audio) {
                logger.info("[AudioElements] autoPlay: sentence");
                void audio.play();
              } else {
                logger.debug("[AudioElements] autoPlay: no sentence audio to chain");
              }
            };
          } else {
            logger.debug("[AudioElements] autoPlay: no expression audio to play");
          }
        }
      },
    ),
  );

  // The back template cut Anki's queue down to the expression audio (see
  // template/back.html). Play the sentence audio of the group on screen once
  // the expression audio is over.
  onMount(async () => {
    const w = window as {
      kikuenSentenceAudio?: { play?: string; at: number };
      pycmd?: (cmd: string) => void;
    };
    const pending = w.kikuenSentenceAudio;
    delete w.kikuenSentenceAudio;
    const play = pending?.play;
    if (nested || !pending || !play) return;

    // ponytail: Anki does not tell the page when a sound ends, so the length is
    // read from the file, whose name only AnkiConnect knows. Without it, guess.
    let seconds = 1.5;
    try {
      const { result } = await AnkiConnect.invoke("cardsInfo", {
        cards: [Number($ankiFields.CardID)],
      });
      const file = result[0].fields.ExpressionAudio.value.match(/\[sound:([^\]]+)\]/)[1];
      seconds = await new Promise<number>((resolve, reject) => {
        const audio = new Audio(encodeURIComponent(file));
        audio.onloadedmetadata = () => resolve(audio.duration);
        audio.onerror = reject;
      });
    } catch (e) {
      logger.debug("[AudioElements] expression audio length unknown:", e);
    }

    // 200ms covers the delay before Anki's player starts.
    const wait = pending.at + seconds * 1000 + 200 - performance.now();
    setTimeout(() => {
      // Skip when the card or the group changed meanwhile.
      if (aborter.signal.aborted || $index() !== 0) return;
      logger.info("[AudioElements] autoPlay: sentence of the current group");
      w.pycmd?.(play);
    }, wait);
  });

  onMount(() => {
    if ($card.isNsfw && $config.muteNsfw && !isAnkiDroidOldStudyScreen) {
      const anchor = $card.expressionAudioRef?.querySelector("a");
      logger.info(
        "[AudioElements] NSFW mute:",
        anchor ? "applied" : "no expression audio anchor to click",
      );
      anchor?.click();
    }
  });

  return (
    <>
      <div
        style={hiddenStyle}
        ref={(ref) => $setCard("expressionAudioRef", ref)}
        innerHTML={$isRootAnkiFields() ? $ankiFields.ExpressionAudio : undefined}
      >
        {!$isRootAnkiFields() && <AudioTag text={$ankiFields.ExpressionAudio} />}
      </div>
      <div
        style={hiddenStyle}
        ref={(ref) => $setCard("sentenceAudioRef", ref)}
        innerHTML={$isRootAnkiFields() ? $group().sentenceAudioField : undefined}
      >
        {!$isRootAnkiFields() && <AudioTag text={$group().sentenceAudioField} />}
      </div>
    </>
  );
}
