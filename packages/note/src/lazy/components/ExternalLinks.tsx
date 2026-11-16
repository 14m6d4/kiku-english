import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useConfigContext } from "#/src/contexts/ConfigContext";
import { useCtxContext } from "#/src/contexts/CtxContext";
import { useFieldGroupContext } from "#/src/contexts/FieldGroupContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { parseHtml } from "#/src/lib/dom";
import { ErrorBoundary, For, Show } from "solid-js";
import { externalLinkIcons } from "./external-link-icons";

export function ExternalLinks() {
  const { $general } = useGeneralContext();
  const ctx = useCtxContext();

  return (
    <ErrorBoundary fallback={<DefaultExternalLinks />}>
      <Show when={$general.plugin?.ExternalLinks} fallback={<DefaultExternalLinks />}>
        {(get) => {
          const ExternalLinks = get();
          return <ExternalLinks ctx={ctx} DefaultExternalLinks={DefaultExternalLinks} />;
        }}
      </Show>
    </ErrorBoundary>
  );
}

const LINKS = [
  ["Cambridge", "https://dictionary.cambridge.org/dictionary/english/"],
  ["Oxford", "https://www.oxfordlearnersdictionaries.com/search/english/?q="],
  ["YouGlish", "https://youglish.com/pronounce/"],
  ["Google", "https://www.google.com/search?q="],
] as const;

function DefaultExternalLinks() {
  const { $ankiFields } = useAnkiFieldContext();
  const { $config } = useConfigContext();
  const { $group } = useFieldGroupContext();

  const $aiHref = () => {
    const sentence = parseHtml($group().sentenceField).body.textContent?.trim() ?? "";
    const prompt = $config.aiPrompt
      .replaceAll("{word}", () => $ankiFields.Expression)
      .replaceAll("{sentence}", () => sentence);
    return $config.aiUrl + encodeURIComponent(prompt);
  };

  return (
    <>
      <For each={LINKS}>
        {([name, url]) => (
          <a
            href={url + encodeURIComponent($ankiFields.Expression)}
            target="_blank"
            rel="noopener"
            title={name}
          >
            <img
              class="size-5 object-contain rounded-xs"
              src={externalLinkIcons[name]}
              alt={name}
            />
          </a>
        )}
      </For>
      <Show when={$config.aiUrl}>
        <a
          class="text-xs font-bold leading-5 px-1 rounded-xs bg-primary text-primary-content"
          href={$aiHref()}
          target="_blank"
          rel="noopener"
          title="Ask AI about this word"
        >
          AI
        </a>
      </Show>
    </>
  );
}
