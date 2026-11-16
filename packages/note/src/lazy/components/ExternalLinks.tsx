import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useCtxContext } from "#/src/contexts/CtxContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { ErrorBoundary, For, Show } from "solid-js";

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

  return (
    <For each={LINKS}>
      {([name, url]) => (
        <a
          class="text-xs link link-hover opacity-70"
          href={url + encodeURIComponent($ankiFields.Expression)}
          target="_blank"
          rel="noopener"
        >
          {name}
        </a>
      )}
    </For>
  );
}
