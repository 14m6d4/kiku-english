# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Kiku English forked from [Kiku](https://github.com/youyoumu/kiku) v2.1.0 and restarts its version at 0.1.0, which is not released yet. For releases up to v2.1.0, see [Kiku's changelog](https://github.com/youyoumu/kiku/blob/main/CHANGELOG.md).

## [Unreleased]

### Added

- IPA reading from Yomitan, rendered as HTML; same-reading notes match on the first IPA
- One definition page per dictionary
- Link icons and an ask-AI link (prompt defaults to Vietnamese)
- Audio per definition group
- English dictionary links: Cambridge, Oxford Learner's, YouGlish and Google
- `pnpm apply` creates the `Kiku English` note type through AnkiConnect when it is missing

### Changed

- **Breaking:** note type renamed to `Kiku English`; media files, globals, custom element and storage keys use `_kikuen`/`kikuen`, so it installs next to Kiku
- **Breaking:** Latin fonts by default
- Front-side IPA restyled
- Dictionary styles trimmed to the generic rules
- Release links point at this fork
- `pnpm apply` runs on Windows

### Removed

- **Breaking:** Japanese-only features and fields: furigana, pitch accent, kanji lookups and data, vertical text, and the `ExpressionFurigana`, `SentenceFurigana`, `PitchPosition` and `PitchCategories` fields
- Japanese-only example plugins
- Kiku's docs site and Kiku Note Manager addon

[Unreleased]: https://github.com/14m6d4/kiku-english/commits/main
