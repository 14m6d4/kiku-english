import type { AnkiFields } from "#/src/lib/types";

const sentence = [
  `<span data-group-id="12">Push the image to the <b>registry</b> before you deploy it.</span>`,
  `<span data-group-id="11">Editing the Windows <b>registry</b> by hand can break your system.</span>`,
  `They put a toaster on their wedding <b>registry</b>.`,
].join("");

const definition = (dictionary: string, body: string) =>
  `<div style="text-align: left;" class="yomitan-glossary"><ol><li data-dictionary="${dictionary}"><i>(${dictionary})</i> ${body}</li></ol></div>`;

// Media files are not in the repo; the dev server serves them from your Anki collection if present.
export const exampleFields: AnkiFields = {
  Expression: "registry",
  ExpressionFurigana: "",
  ExpressionReading: "/ˈredʒɪstri/",
  ExpressionAudio: "",
  RelatedExpression: "",
  SelectionText: "",
  MainDefinition: definition(
    "Demo English Dictionary",
    "<span><b>noun</b> a place where official records are kept; in computing, a store of images or settings.</span>",
  ),
  DefinitionPicture: "",
  Sentence: sentence,
  SentenceFurigana: "",
  SentenceTranslation: "",
  SentenceAudio: [
    `<span data-group-id="12">[sound:kikuen_demo_registry_12.wav]</span>`,
    `<span data-group-id="11">[sound:kikuen_demo_registry_11.wav]</span>`,
    `[sound:kikuen_demo_registry_0.wav]`,
  ].join(""),
  Picture: [
    `<img data-group-id="12" src="kikuen_demo_registry_12.svg">`,
    `<img data-group-id="11" src="kikuen_demo_registry_11.svg">`,
    `<img src="kikuen_demo_registry_0.svg">`,
  ].join(""),
  Glossary:
    definition(
      "Demo English Dictionary",
      "<span><b>noun</b> a place where official records are kept; in computing, a store of images or settings.</span>",
    ) +
    definition("Từ điển Anh - Việt demo", "<span><b>danh từ</b> sổ đăng ký; nơi đăng ký.</span>"),
  Hint: "",
  IsWordAndSentenceCard: "",
  IsClickCard: "",
  IsSentenceCard: "",
  IsAudioCard: "",
  PitchPosition: "",
  PitchCategories: "",
  Frequency: `<ul style="text-align: left;"><li>Demo Frequency: 4821</li></ul>`,
  FreqSort: "4821",
  MiscInfo: [
    `<span data-group-id="12">Demo · Docker Deep Dive E03</span>`,
    `<span data-group-id="11">Demo · Sysadmin Stories E12</span>`,
    `Demo · The Big Day S01E05`,
  ].join(""),
  Tags: "yomitan",
  CardID: "1785064007553",
  "furigana:ExpressionFurigana": "",
  "kana:ExpressionFurigana": "",
  "furigana:Sentence": sentence,
  "kanji:Sentence": sentence,
  "furigana:SentenceFurigana": "",
  "kana:SentenceFurigana": "",
};
