# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Song Konverter turns Ultimate Guitar-style text (chords on their own line above the lyrics) into ChordPro for MobileSheets on Android. It is a fully client-side React 19 + Vite + Tailwind v4 app, packaged as a Linux AppImage with Electron. The UI text, README, and code comments in `electron/` are in German, so keep user-facing strings in German.

## Commands

```bash
npm run dev            # Vite dev server on port 3000
npm run lint           # Type check only (tsc --noEmit); there is no ESLint
npm run build          # Production build to dist/
npm run electron:dev   # Electron window loading http://localhost:3000 (run `npm run dev` first)
npm run electron:start # vite build + run Electron against dist/
npm run dist:linux     # Build AppImage to release/Song-Konverter-<version>.AppImage
```

- If Electron is launched from VS Code, `ELECTRON_RUN_AS_NODE` may be set and Electron won't start as an app. Prefix with `env -u ELECTRON_RUN_AS_NODE`.
- There is no test framework. The converter modules have no imports, so Node 24 can run them directly for quick checks:
  ```bash
  node --input-type=module -e "import {convertToChordPro} from './src/utils/chordproConverter.ts'; console.log(convertToChordPro('Am    C\nhello world'))"
  ```
- The version is in `package.json` and appears in the AppImage file name. Bump it there (and in `package-lock.json`) for releases.

## Architecture

**Conversion pipeline (`src/utils/chordproConverter.ts`)**: this is where the logic lives. `convertToChordPro(input, options)` makes one line-by-line pass:
1. `parseMetadata` pulls title/artist/key/capo/tempo out of the header lines. `custom*` options (from the metadata fields in the UI) override the parsed values.
2. Section headers like `[Verse 1]` go through `getSectionDirective` to become `{start_of_verse: …}` / `{sov}` / `{c: …}`, depending on `sectionDirectiveStyle`. An open section is closed at the next header **or at the next blank line**.
3. Runs of `isTabLine` lines are wrapped in `{start_of_tab}`/`{end_of_tab}`. Lines inside a `[Tab]` section are passed through unchanged.
4. When `isChordLine` is followed by a lyrics line, `weaveChordsIntoLyrics` inserts `[Chord]` at each chord's exact column. A chord line with no lyrics after it becomes a standalone line (`[Em][A7]`).
5. Consecutive blank lines are collapsed into one.

Chord-line detection is heuristic, and most bugs come from here. `isChordLine` cleans each token, checks it against `CHORD_REGEX`, and treats words in `COMMON_WORDS` (an English and German stop-word list) as lyrics. A line only counts as chords if ≥60% of its tokens are chords and it has at most one word. Words that are also chord names cause false positives and negatives (e.g. German `am` vs. chord `Am`). `isTabLine` likewise relies on dash ratios and a list of lyric words.

**Transposition (`src/utils/chordTransposer.ts`)**: works on the ChordPro *output*. It rewrites `[...]` chord tokens (including slash bass notes) and the `{key: …}` directive.

**Preview (`src/components/MobileSheetsPreview.tsx`)**: has its own ChordPro parser for rendering, separate from the converter. If you add or rename a directive in the converter, update the preview parser as well (both long and short forms such as `start_of_verse`/`sov`).

**State (`src/App.tsx`)**: one large component holds all state: input/output text, metadata fields, `ConverterOptions`, and view mode. There is no persistence. The right-hand ChordPro editor can be edited freely, and re-converting overwrites it. On startup the first entry of `SAMPLE_SONGS` (Incubus – Drive) is loaded.

**Electron (`electron/main.cjs`)**: a minimal CommonJS main process with no preload or IPC. `ELECTRON_DEV=1` loads the dev server, otherwise it loads `dist/index.html`. That is why `vite.config.ts` sets `base: './'`. Only `dist/**` and `electron/**` are packaged.
