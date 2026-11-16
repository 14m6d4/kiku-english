import { createContext, type JSX, onMount, useContext } from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { createCompatPair } from "#/src/lib/context-compat";
import type { AnkiNote } from "#/src/lib/types";
import { useGeneralContext } from "#/src/contexts/GeneralContext";

export type RelatedPageTab = "reading" | "same" | "related";

export type RelatedPageContextStore = {
  tab: RelatedPageTab;
};

export type RelatedPageContextValue = {
  $relatedPage: Store<RelatedPageContextStore>;
  $setRelatedPage: SetStoreFunction<RelatedPageContextStore>;
  sameReading: AnkiNote[];
  sameExpression: AnkiNote[];
  relatedExpression: AnkiNote[];
};

const RelatedPageContext = createContext<RelatedPageContextValue>();

export function RelatedPageContextProvider(props: {
  children: JSX.Element;
  sameReading?: AnkiNote[];
  sameExpression?: AnkiNote[];
  relatedExpression?: AnkiNote[];
  initialTab: RelatedPageTab;
  id: string;
}) {
  // The cache keeps the selected tab when you open a note from the list and come back.
  const { relatedPageCache: cache } = useGeneralContext();
  const saved = cache.get(props.id);
  const [$relatedPage, $setRelatedPage] = saved
    ? [saved.$relatedPage, saved.$setRelatedPage]
    : createStore<RelatedPageContextStore>({ tab: props.initialTab });

  const value = {
    $relatedPage,
    $setRelatedPage,
    sameReading: props.sameReading ?? [],
    sameExpression: props.sameExpression ?? [],
    relatedExpression: props.relatedExpression ?? [],
  };

  onMount(() => {
    cache.set(props.id, value);
  });

  return <RelatedPageContext.Provider value={value}>{props.children}</RelatedPageContext.Provider>;
}

export function useRelatedPageContext() {
  const store = useContext(RelatedPageContext);
  if (!store) throw new Error("Missing RelatedPageContext");
  return Object.assign(
    createCompatPair("$relatedPage", "$setRelatedPage", store.$relatedPage, store.$setRelatedPage),
    { ...store },
  );
}
