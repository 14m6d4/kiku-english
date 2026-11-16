# Kiku English

An Anki note type for learning English by sentence mining with Yomitan and asbplayer.

Kiku English is a hard fork of [Kiku](https://github.com/youyoumu/kiku) by youyoumu, which is built for Japanese learners. The card behaves the same way; the Japanese-only parts (furigana, pitch accent, kanji lookups, vertical text) are removed, and a few things are changed for English:

- The pronunciation (IPA) is shown under the word.
- Lookup links go to Cambridge, Oxford Learner's, YouGlish and Google.
- Fonts default to Latin system fonts.
- Each dictionary gets its own definition page, in the order Yomitan lists them.

The note type is called `Kiku English` and its files are prefixed `_kikuen`, so it can be installed next to the original `Kiku`.

Terms used in this project are defined in [GLOSSARY.md](GLOSSARY.md). Why this is a fork rather than a plugin is recorded in [docs/adr](docs/adr/0001-hard-fork-and-delete-japanese-code.md).

## Install

There is no `.apkg` release yet. Build it and push it to a running Anki:

1. Install [AnkiConnect](https://ankiweb.net/shared/info/2055492159) and keep Anki open, with no editor or browser window open.
2. `pnpm install`
3. `cd packages/note && pnpm apply`

`pnpm apply` creates the `Kiku English` note type on the first run and updates its templates afterwards. It assumes the Anki profile `User 1`; for another profile set `ANKI_USER` (or `ANKI_COLLECTION_MEDIA_PATH`) in `packages/note/.env`, starting from `.env.example`.

## Yomitan

In Yomitan settings, `Anki` > `Configure Anki flashcard`, pick `Kiku English` as the model:

| Field                 | Value                                                         |
| --------------------- | ------------------------------------------------------------- |
| Expression            | `{expression}`                                                |
| ExpressionReading     | `{phonetic-transcriptions}` (needs an IPA dictionary)         |
| ExpressionAudio       | `{audio}`                                                     |
| RelatedExpression     |                                                               |
| SelectionText         | `{popup-selection-text}`                                      |
| MainDefinition        | Optional. A `{single-glossary-...}` marker for one dictionary |
| DefinitionPicture     |                                                               |
| Sentence              | `{cloze-prefix}<b>{cloze-body}</b>{cloze-suffix}`             |
| SentenceTranslation   |                                                               |
| SentenceAudio         |                                                               |
| Picture               |                                                               |
| Glossary              | `{glossary}`                                                  |
| Hint                  |                                                               |
| IsWordAndSentenceCard |                                                               |
| IsClickCard           |                                                               |
| IsSentenceCard        |                                                               |
| IsAudioCard           |                                                               |
| Frequency             | `{frequencies}`                                               |
| FreqSort              | `{frequency-harmonic-rank}`                                   |
| MiscInfo              | `{document-title}`                                            |

Put the English-English dictionary first in Yomitan's dictionary order: it becomes the first definition page, and the other dictionaries follow on the next pages.

## asbplayer

In asbplayer settings, `Anki`, pick `Kiku English` as the note type:

| asbplayer field | Note field          |
| --------------- | ------------------- |
| Sentence        | Sentence            |
| Word            | Expression          |
| Audio           | SentenceAudio       |
| Image           | Picture             |
| Source          | MiscInfo            |
| Translation     | SentenceTranslation |

Mine the word with Yomitan first, then use asbplayer's "update last card" to add the picture and the sentence audio.

## Plugins

The card loads `_kikuen_plugin.js` and `_kikuen_plugin.css` from Anki's `collection.media`; `pnpm apply` creates them empty on the first run. Write your own (hooks are typed in `packages/note/plugins/plugin-types.ts`) or install an example from `packages/note/plugins/`:

```sh
cd packages/note
pnpm plugin:copy confetti     # or plugin:symlink to edit it in place
```

Installing a plugin overwrites the current `_kikuen_plugin.*` files, so only one example is active at a time. Run either command without a name to list the examples.

`pnpm apply` creates the empty stubs only when the files are missing, so an installed plugin survives it.

## Development

From `packages/note`:

- `pnpm dev` serves a preview of the card's back side on <http://localhost:5173>; add `?side=front#` for the front. Example fields come from `src/lib/examples.ts`.
- `pnpm apply` builds and pushes the note type to Anki (see Install). `pnpm apply:fast` skips the type check, but needs a POSIX shell.

From the root: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.

## Limits

- Related notes are found through AnkiConnect, so they show on desktop only. The Kiku Note Manager add-on builds its cache for the original `Kiku` note type, not this one.
- AnkiDroid is not tested yet.

## Credit

All of the design and nearly all of the code come from [Kiku](https://github.com/youyoumu/kiku) by youyoumu, released under the MIT licence. Kiku in turn credits [Lapis](https://github.com/donkuri/lapis), [JPMN](https://github.com/Aquafina-water-bottle/jp-mining-note) and [Senren](https://github.com/BrenoAqua/Senren).
