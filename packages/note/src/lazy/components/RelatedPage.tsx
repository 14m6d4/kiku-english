import { createMemo, ErrorBoundary, For, type JSX, onMount, Show, Suspense } from "solid-js";
import { useCardContext } from "#/src/contexts/CardContext";
import { useNavigationTransition } from "#/src/hooks/transition";
import { type AnkiFields, type AnkiNote, ankiFieldsSkeleton } from "#/src/lib/types";
import { useAnkiFieldContext } from "#/src/contexts/AnkiFieldsContext";
import { useGeneralContext } from "#/src/contexts/GeneralContext";
import { HeaderRelatedPage } from "./HeaderRelatedPage";
import { ArrowLeftIcon } from "./Icons";
import {
  RelatedPageContextProvider,
  type RelatedPageTab,
  useRelatedPageContext,
} from "#/src/lazy/contexts/RelatedPageContext";

const TABS: { tab: RelatedPageTab; label: string; title: string }[] = [
  { tab: "reading", label: "Reading", title: "Same Reading" },
  { tab: "same", label: "Same", title: "Same Expression" },
  { tab: "related", label: "Related", title: "Related" },
];

export function RelatedPage() {
  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <$RelatedPage />
      </Suspense>
    </ErrorBoundary>
  );
}
function $RelatedPage() {
  const { $card, $$card } = useCardContext();
  return (
    <RelatedPageContextProvider
      sameReading={$$card()?.sameReading}
      sameExpression={$$card()?.sameExpression}
      relatedExpression={$$card()?.relatedExpression}
      initialTab={$card.initialTab}
      id={$card.uniqueId}
    >
      <Page />
    </RelatedPageContextProvider>
  );
}

function Page() {
  const { onRelatedPageMount } = useCardContext();
  const { initialAnkiFields } = useAnkiFieldContext();
  const { $relatedPage, $setRelatedPage, sameReading, sameExpression, relatedExpression } =
    useRelatedPageContext();

  const lists = { reading: sameReading, same: sameExpression, related: relatedExpression };

  onMount(() => {
    onRelatedPageMount.forEach((callback) => {
      callback({ $setRelatedPage });
    });
    onRelatedPageMount.clear();
  });

  return (
    <>
      <HeaderRelatedPage />
      <div class="flex flex-col gap-2 sm:gap-4">
        <div role="tablist" class="tabs tabs-box animate-fade-in">
          <For each={TABS}>
            {(t) => (
              <TabItem
                active={$relatedPage.tab === t.tab}
                count={lists[t.tab].length}
                onClick={() => $setRelatedPage("tab", t.tab)}
              >
                {t.label}
              </TabItem>
            )}
          </For>
        </div>
        <div class="flex flex-col items-center gap-2 animate-fade-in">
          <div class="font-secondary text-5xl sm:text-6xl">{initialAnkiFields.Expression}</div>
          <Show when={initialAnkiFields.ExpressionReading}>
            <div
              class="text-base-content-calm text-base sm:text-lg"
              innerHTML={initialAnkiFields.ExpressionReading}
            ></div>
          </Show>
          <div class="text-base-content-calm text-base sm:text-lg">
            {TABS.find((t) => t.tab === $relatedPage.tab)?.title}
          </div>
        </div>

        <ul class="list bg-base-100 rounded-box shadow-md animate-fade-in">
          <For each={lists[$relatedPage.tab]}>{(note) => <AnkiNoteItem data={note} />}</For>
        </ul>
      </div>
      <QueryInfo />
    </>
  );
}

function QueryInfo() {
  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <$QueryInfo />
      </Suspense>
    </ErrorBoundary>
  );
}

function $QueryInfo() {
  const { $$notesManifest } = useGeneralContext();
  const { $$card } = useCardContext();

  return (
    <div class="flex justify-center items-center">
      <Show when={!$$card()?.isNotesCache}>
        <div class="text-base-content-faint text-sm">[AnkiConnect]</div>
      </Show>
      <Show when={$$notesManifest() && $$card()?.isNotesCache}>
        <div class="text-base-content-faint text-sm">
          [Notes Cache] Updated at {new Date($$notesManifest()?.generatedAt ?? 0).toLocaleString()}
        </div>
      </Show>
    </div>
  );
}

function TabItem(props: {
  active: boolean;
  children: JSX.Element;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      class="tab gap-1 text-sm sm:text-base"
      classList={{
        "tab-active": props.active,
        "cursor-not-allowed": !props.count,
      }}
      on:click={() => {
        if (props.count) props.onClick();
      }}
      on:touchend={(e) => e.stopPropagation()}
    >
      {props.children}
      <span class="text-base-content-soft bg-base-300 px-0.5 rounded-xs text-xs sm:text-sm">
        {props.count}
      </span>
    </button>
  );
}

function AnkiNoteItem(props: { data: AnkiNote }) {
  const { navigate } = useNavigationTransition();
  const { $setCard, $$card } = useCardContext();
  const $data = createMemo(() => props.data);
  const $leech = createMemo(() => $data().tags.includes("leech"));
  const $$isNew = createMemo(
    () => $$card()?.newNotes.some((n) => n.noteId === $data().noteId) ?? false,
  );

  const onNextClick = () => {
    const ankiFields: AnkiFields = {
      ...ankiFieldsSkeleton,
      ...Object.fromEntries(
        Object.entries($data().fields).map(([key, value]) => {
          return [key, value.value];
        }),
      ),
      CardID: $data().cards[0]?.toString() ?? "",
      Tags: $data().tags.join(" "),
    };

    $setCard({ nestedAnkiFields: ankiFields });
    $setCard("nestedNoteId", $data().noteId);
    navigate("nested", "forward", () => navigate("related", "back"));
  };

  return (
    <li class="list-row flex gap-2 relative items-end">
      <div class="flex flex-col gap-2 flex-1">
        <div class="flex gap-2 items-end flex-wrap">
          <div class="font-secondary text-2xl sm:text-4xl">{$data().fields.Expression.value}</div>
          <div class="text-base-content-calm text-xs sm:text-sm">
            <div innerHTML={$data().fields.ExpressionReading?.value} />
            <div>{new Date($data().noteId).toLocaleDateString()}</div>
          </div>
        </div>

        <div
          class="text-base sm:text-xl text-base-content-calm font-secondary"
          innerHTML={$data().fields.Sentence.value}
        ></div>
      </div>

      <div class="flex justify-center items-center">
        <button
          on:click={() => {
            onNextClick();
          }}
          on:touchend={(e) => e.stopPropagation()}
        >
          <ArrowLeftIcon class="size-5 sm:size-8 text-base-content-soft rotate-180 cursor-pointer"></ArrowLeftIcon>
        </button>
      </div>

      <Show when={$$isNew() || $leech()}>
        <div class="flex items-center gap-1 absolute top-4 right-4">
          {$leech() && <div class="status status-warning"></div>}
          {$$isNew() && <div class="status status-info"></div>}
        </div>
      </Show>
    </li>
  );
}
