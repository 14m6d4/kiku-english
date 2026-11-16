# Hard fork of Kiku with Japanese code deleted

Kiku is built for Japanese, and its maintainer declined to support other languages and suggested forking (upstream issue #74). We forked it into a separately named note type (`Kiku English`, media prefix `_kikuen`) that installs next to upstream, and we delete the Japanese-only code (furigana, pitch accent, kanji tooltip and data, vertical text) instead of disabling it. We do not plan to merge from upstream; a fix worth having is cherry-picked by hand.

## Considered Options

- **Upstream plus a plugin.** No build to maintain, but a plugin cannot remove note fields, has no hook for the Expression area, and cannot rename the note type.
- **Cloning the note type inside Anki.** Lets fields be removed, but the shared JavaScript only searches note types named `Kiku` or `Lapis`, so related notes break, and saving settings rewrites only the `Kiku` template.
- **Fork but keep the Japanese code switched off.** Easier merges, at the cost of carrying dead code and 2.7 MB of kanji data on every card. Upstream had been quiet for months and is considered feature-complete, so merge ease was worth little.

## Consequences

- Both note types share one Anki collection, so every runtime name (media files, globals, custom elements, storage keys) must stay distinct from upstream's.
- Upstream's Kiku Note Manager addon does not recognise this note type; it is not forked, and its source (`packages/addon`) is deleted from the repo. Related notes go through AnkiConnect from the card itself.
- Upstream's VitePress docs site (`apps/docs`) is deleted rather than adapted: it documented Japanese-only features and `_kiku` files, and we do not publish a docs site. Install and setup instructions live in the README.
