/**
 * ChordPro Converter for Ultimate Guitar Tabs
 * Formats chords and lyrics into standard ChordPro format for MobileSheets
 */

export interface ConverterOptions {
  sectionDirectiveStyle: 'full' | 'short' | 'comment'; // full: {start_of_verse}, short: {sov}, comment: {c: Verse}
  standaloneChordSpacing: 'compact' | 'spaced'; // compact: [Em][A7], spaced: [Em] [A7]
  ignoreNC: boolean; // whether to omit N.C. / NC
  detectMetadata: boolean; // whether to parse Title, Artist, Key, Capo, etc.
  titleArtistOrder: 'artist-title' | 'title-artist'; // default: Artist - Title
  customTitle?: string;
  customArtist?: string;
  customKey?: string;
  customCapo?: string;
  customTempo?: string;
  customTime?: string;
  wrapTabBlocks?: boolean; // whether to wrap guitar/bass tabs in {start_of_tab} ... {end_of_tab}
}

export const defaultOptions: ConverterOptions = {
  sectionDirectiveStyle: 'full',
  standaloneChordSpacing: 'compact',
  ignoreNC: false, // N.C. is shown by default
  detectMetadata: true,
  titleArtistOrder: 'artist-title',
  wrapTabBlocks: true,
};

// Recognized musical roots (A-G with sharps/flats, plus German H/Hb)
export const ROOT_PATTERN = '(?:[A-G][b#]?|[Hh][b#]?)';

// Comprehensive chord regex matching all standard, extended, altered, slash, and power chords
export const CHORD_REGEX =
  /^(?:[A-G][b#]?|[Hh][b#]?)(?:m|min|maj|M|dom|dim|aug|sus[24]?|add[249]?|alt|no[0-9]?|omit[0-9]?|[0-9]{1,2}|b[0-9]{1,2}|#[0-9]{1,2}|\+|\-|\*|o|º|°|ø|Δ|\^|\([^)]*\)|6\/9|\/maj7|b|#)*(?:\/(?:[A-G][b#]?|[Hh][b#]?))?$/i;

export const NC_REGEX = /^(N\.C\.|NC)$/i;

/**
 * Determines if a line is a guitar or bass tablature line
 */
export function isTabLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Don't treat directives or section headers as tab lines
  if (/^\[.+\]$/.test(trimmed) || /^\{.+\}$/.test(trimmed)) return false;

  const hyphenCount = (trimmed.match(/-/g) || []).length;
  if (hyphenCount < 4) return false;

  // Ignore lines with common lyrics words (e.g. "-------Do do do do do (x4)")
  if (/\b(do|la|na|yeah|the|you|and|so|to|of|in|is|it|we|my|me)\b/i.test(trimmed)) {
    return false;
  }

  // 1. String prefix with bar, e.g., "e|---", "B |---", "G |--", "D|--", "E |--"
  if (/^[eEBGDAbC1-7]?\s*\|[-0-9a-zA-Z\/\\~xX\|\s\(\)\^Lhprsbtv\<\>]+\|*$/i.test(trimmed)) {
    return true;
  }

  // 2. Dash sequences with fret numbers / bar lines, e.g. "-------------------||"
  if (/^[-0-9a-zA-Z\/\\~xX\|\s\(\)\^Lhprsbtv\<\>]+$/i.test(trimmed)) {
    const nonWs = trimmed.replace(/\s/g, '');
    if (nonWs.length >= 8) {
      const dashRatio = hyphenCount / nonWs.length;
      if (dashRatio >= 0.35 && (/\|/.test(trimmed) || /\d/.test(trimmed))) {
        return true;
      }
    }
  }

  return false;
}

// Common words that could accidentally match a single-letter chord like "A"
const COMMON_WORDS = new Set([
  'a', 'i', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'the', 'is', 'it', 'me', 'my', 'we', 'so',
  'be', 'as', 'do', 'no', 'if', 'or', 'by', 'up', 'an', 'he', 'she', 'und', 'der', 'die', 'das',
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'ein', 'eine', 'im', 'am', 'mit', 'den',
  'dem', 'des', 'von', 'zu', 'auf', 'aus', 'bei', 'nach', 'wie', 'so', 'ist', 'hat', 'war'
]);

export interface ChordToken {
  chord: string;
  col: number;
  raw: string;
}

/**
 * Cleans a chord token from surrounding brackets/braces/punctuation while preserving inner chord syntax
 */
export function cleanChordToken(token: string): string {
  let clean = token.trim();
  if (NC_REGEX.test(clean)) return clean;

  // Strip outer square brackets [Em] or braces {Em}
  if ((clean.startsWith('[') && clean.endsWith(']')) || (clean.startsWith('{') && clean.endsWith('}'))) {
    clean = clean.slice(1, -1).trim();
  } else if (clean.startsWith('(') && clean.endsWith(')')) {
    const inside = clean.slice(1, -1).trim();
    if (inside && !inside.includes('(') && !inside.includes(')')) {
      clean = inside;
    }
  }
  // Strip trailing separator punctuation if attached (e.g. "Em," or "G:"), but not for N.C.
  if (!NC_REGEX.test(clean)) {
    clean = clean.replace(/[,\.:;]+$/, '').trim();
  }
  return clean;
}

/**
 * Checks if a string is a valid chord
 */
export function isValidChord(token: string): boolean {
  const clean = cleanChordToken(token);
  if (!clean) return false;
  if (NC_REGEX.test(clean)) return true;
  return CHORD_REGEX.test(clean);
}

/**
 * Determines if a line is a chord line
 */
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Don't treat section headers as chord lines
  if (/^\[.+\]$/.test(trimmed) || /^\{.+\}$/.test(trimmed)) return false;

  // Tab lines are not chord lines
  if (isTabLine(trimmed)) return false;

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  let wordCount = 0;

  for (const token of tokens) {
    const cleanToken = cleanChordToken(token);
    const lower = cleanToken.toLowerCase();

    // If it's a common stop word (like "and", "the", "in", "to") that isn't clearly a chord
    if (COMMON_WORDS.has(lower) && !['a'].includes(lower)) {
      wordCount++;
      continue;
    }

    if (isValidChord(cleanToken)) {
      chordCount++;
    } else if (/^[|/\\\-–—\.\:\(\)]+$/.test(token)) {
      // Bar lines or separators are allowed on chord lines
      chordCount++;
    } else {
      wordCount++;
    }
  }

  // If there are words and no chords, it's definitely not a chord line
  if (chordCount === 0) return false;

  // If single token is 'A' or 'I', only chord if line has chord spacing or uppercase
  if (tokens.length === 1) {
    if (tokens[0] === 'I' || tokens[0] === 'i') return false;
    if (tokens[0] === 'a') return false;
  }

  // Chord ratio threshold: >= 60% of tokens are valid chords and not dominated by words
  const ratio = chordCount / tokens.length;
  return ratio >= 0.6 && wordCount <= 1;
}

/**
 * Extracts chord tokens and their exact column positions from a chord line
 */
export function extractChordsFromLine(line: string, ignoreNC = false): ChordToken[] {
  const chords: ChordToken[] = [];
  // Tokenize while tracking column positions
  const regex = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    const raw = match[0];
    const col = match.index;
    const clean = cleanChordToken(raw);

    if (ignoreNC && NC_REGEX.test(clean)) {
      continue;
    }

    if (isValidChord(clean)) {
      chords.push({ chord: clean, col, raw });
    }
  }

  return chords;
}

/**
 * Weaves chord line into lyrics line using exact column alignment
 */
export function weaveChordsIntoLyrics(chordLine: string, lyricsLine: string, ignoreNC = false): string {
  const chords = extractChordsFromLine(chordLine, ignoreNC);
  if (chords.length === 0) return lyricsLine;

  let result = '';
  let lastCol = 0;

  for (const item of chords) {
    const { chord, col } = item;

    if (col < lyricsLine.length) {
      // Append lyrics up to this column
      result += lyricsLine.slice(lastCol, col);
      result += `[${chord}]`;
      lastCol = col;
    } else {
      // Column is beyond current lyrics length
      if (lastCol < lyricsLine.length) {
        result += lyricsLine.slice(lastCol);
        lastCol = lyricsLine.length;
      }
      result += `[${chord}]`;
    }
  }

  // Append remaining lyrics
  if (lastCol < lyricsLine.length) {
    result += lyricsLine.slice(lastCol);
  }

  return result;
}

/**
 * Formats a standalone chord line (when there are no lyrics below)
 */
export function formatStandaloneChordLine(line: string, spacing: 'compact' | 'spaced' = 'compact', ignoreNC = false): string {
  const chords = extractChordsFromLine(line, ignoreNC);
  if (chords.length === 0) return '';
  if (spacing === 'compact') {
    return chords.map(c => `[${c.chord}]`).join('');
  }
  return chords.map(c => `[${c.chord}]`).join(' ');
}

export interface SectionDirective {
  start: string;
  end: string;
  type: 'verse' | 'chorus' | 'bridge' | 'part' | 'tab' | 'comment';
  name: string;
}

/**
 * Maps a section name (e.g. "Intro", "Verse 1", "Tab", "Tabulatur", "Chorus") to ChordPro directives
 */
export function getSectionDirective(sectionRaw: string, style: ConverterOptions['sectionDirectiveStyle']): SectionDirective {
  const name = sectionRaw.trim();
  const lower = name.toLowerCase();

  let type: 'verse' | 'chorus' | 'bridge' | 'part' | 'tab' = 'part';
  if (/^verse(\s*\d+)?$/i.test(lower)) {
    type = 'verse';
  } else if (/^chorus(\s*\d+)?$/i.test(lower) || /^refrain(\s*\d+)?$/i.test(lower)) {
    type = 'chorus';
  } else if (/^bridge(\s*\d+)?$/i.test(lower)) {
    type = 'bridge';
  } else if (/^(tab|tabulatur|tabs|guitar\s*tab|bass\s*tab)(\s*\d+)?$/i.test(lower)) {
    type = 'tab';
  } else {
    type = 'part';
  }

  if (style === 'comment') {
    if (type === 'tab') {
      return { start: '{start_of_tab}', end: '{end_of_tab}', type, name };
    }
    return {
      start: `{comment: ${name}}`,
      end: '',
      type,
      name,
    };
  }

  if (style === 'short') {
    switch (type) {
      case 'verse':
        return { start: `{sov: ${name}}`, end: '{eov}', type, name };
      case 'chorus':
        return { start: `{soc: ${name}}`, end: '{eoc}', type, name };
      case 'bridge':
        return { start: `{sob: ${name}}`, end: '{eob}', type, name };
      case 'tab':
        return { start: '{sot}', end: '{eot}', type, name };
      default:
        return { start: `{sop: ${name}}`, end: '{eop}', type, name };
    }
  }

  // Full style (default, standard MobileSheets)
  switch (type) {
    case 'verse':
      return { start: `{start_of_verse: ${name}}`, end: '{end_of_verse}', type, name };
    case 'chorus':
      return { start: `{start_of_chorus: ${name}}`, end: '{end_of_chorus}', type, name };
    case 'bridge':
      return { start: `{start_of_bridge: ${name}}`, end: '{end_of_bridge}', type, name };
    case 'tab':
      return { start: '{start_of_tab}', end: '{end_of_tab}', type, name };
    default:
      return { start: `{start_of_part: ${name}}`, end: '{end_of_part}', type, name };
  }
}

export interface SongMetadata {
  title?: string;
  artist?: string;
  key?: string;
  capo?: string;
  tempo?: string;
  time?: string;
}

/**
 * Extracts metadata (Title, Artist, Capo, Key, etc.) from raw text
 */
export function parseMetadata(text: string, titleArtistOrder: 'artist-title' | 'title-artist' = 'artist-title'): {
  metadata: SongMetadata;
  remainingText: string;
} {
  const lines = text.split(/\r?\n/);
  const metadata: SongMetadata = {};
  const remainingLines: string[] = [];
  let headerFinished = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (headerFinished) {
      remainingLines.push(line);
      continue;
    }

    if (!trimmed) {
      // Empty line after title or meta
      if (metadata.title || metadata.artist) {
        headerFinished = true;
      }
      continue;
    }

    // Check if line is a section header, chords, or tab line -> header is finished
    if (/^\[.+\]$/.test(trimmed) || isChordLine(line) || isTabLine(line)) {
      headerFinished = true;
      remainingLines.push(line);
      continue;
    }

    // Check explicit metadata keys
    const metaMatch = trimmed.match(/^(Title|Artist|Key|Capo|Tempo|BPM|Time(?:\s*Signature)?)\s*[:=]\s*(.+)$/i);
    if (metaMatch) {
      const key = metaMatch[1].toLowerCase();
      const val = metaMatch[2].trim();
      if (key === 'title') metadata.title = val;
      else if (key === 'artist') metadata.artist = val;
      else if (key === 'key') metadata.key = val;
      else if (key === 'capo') metadata.capo = val.replace(/fret/i, '').trim();
      else if (key === 'tempo' || key === 'bpm') metadata.tempo = val;
      else if (key.startsWith('time')) metadata.time = val;
      continue;
    }

    // Check line 1: "Artist - Title" or "Title - Artist" (e.g. "Incubus - Drive")
    if (!metadata.title && !metadata.artist && (trimmed.includes(' - ') || trimmed.includes(' – ') || trimmed.includes(' — '))) {
      const parts = trimmed.split(/\s*[-–—]\s*/);
      if (parts.length >= 2) {
        const cleanP0 = parts[0].replace(/\(chords.*?\)/i, '').trim();
        const cleanP1 = parts[1].replace(/\(chords.*?\)/i, '').trim();

        if (titleArtistOrder === 'artist-title') {
          metadata.artist = cleanP0;
          metadata.title = cleanP1;
        } else {
          metadata.title = cleanP0;
          metadata.artist = cleanP1;
        }
        continue;
      }
    }

    // Check "by" (e.g. "Drive by Incubus")
    if (!metadata.title && !metadata.artist && /\s+by\s+/i.test(trimmed)) {
      const parts = trimmed.split(/\s+by\s+/i);
      metadata.title = parts[0].trim();
      metadata.artist = parts[1].trim();
      continue;
    }

    // If it's the very first non-empty line and looks like a single song title
    if (!metadata.title && remainingLines.length === 0 && !isChordLine(line) && !isTabLine(line) && !trimmed.startsWith('[')) {
      metadata.title = trimmed;
      continue;
    }

    remainingLines.push(line);
  }

  return { metadata, remainingText: remainingLines.join('\n') };
}

/**
 * Main conversion function: Ultimate Guitar text to ChordPro
 */
export function convertToChordPro(input: string, options: Partial<ConverterOptions> = {}): string {
  const opts: ConverterOptions = { ...defaultOptions, ...options };
  const rawLines = input.split(/\r?\n/);
  if (rawLines.length === 0 || !input.trim()) return '';

  const { metadata: parsedMeta, remainingText } = opts.detectMetadata
    ? parseMetadata(input, opts.titleArtistOrder)
    : { metadata: {}, remainingText: input };

  const finalMeta: SongMetadata = {
    title: opts.customTitle !== undefined && opts.customTitle !== '' ? opts.customTitle : parsedMeta.title,
    artist: opts.customArtist !== undefined && opts.customArtist !== '' ? opts.customArtist : parsedMeta.artist,
    key: opts.customKey !== undefined && opts.customKey !== '' ? opts.customKey : parsedMeta.key,
    capo: opts.customCapo !== undefined && opts.customCapo !== '' ? opts.customCapo : parsedMeta.capo,
    tempo: opts.customTempo !== undefined && opts.customTempo !== '' ? opts.customTempo : parsedMeta.tempo,
    time: opts.customTime !== undefined && opts.customTime !== '' ? opts.customTime : parsedMeta.time,
  };

  const outputLines: string[] = [];

  // Emit header metadata
  if (finalMeta.title) outputLines.push(`{title: ${finalMeta.title}}`);
  if (finalMeta.artist) outputLines.push(`{artist: ${finalMeta.artist}}`);
  if (finalMeta.key) outputLines.push(`{key: ${finalMeta.key}}`);
  if (finalMeta.capo) outputLines.push(`{capo: ${finalMeta.capo}}`);
  if (finalMeta.tempo) outputLines.push(`{tempo: ${finalMeta.tempo}}`);
  if (finalMeta.time) outputLines.push(`{time: ${finalMeta.time}}`);

  if (outputLines.length > 0) {
    outputLines.push('');
  }

  const lines = remainingText.split(/\r?\n/);
  let activeSection: SectionDirective | null = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for section header like [Verse], [Chorus], [Intro], etc.
    const sectionMatch = trimmed.match(/^\[([a-zA-Z0-9_\s\-\(\)\/\.\'\&]+)\]$/);
    if (sectionMatch) {
      // Close previous active section if open
      if (activeSection && activeSection.end) {
        outputLines.push(activeSection.end);
        outputLines.push('');
        activeSection = null;
      }

      const sectionName = sectionMatch[1].trim();
      const directive = getSectionDirective(sectionName, opts.sectionDirectiveStyle);
      outputLines.push(directive.start);
      activeSection = directive;
      i++;
      continue;
    }

    // Empty line
    if (!trimmed) {
      if (activeSection && activeSection.end) {
        outputLines.push(activeSection.end);
        activeSection = null;
      }
      outputLines.push('');
      i++;
      continue;
    }

    // Pass through explicit tab directives without double-wrapping
    if (/^\{(start_of_tab|sot|end_of_tab|eot)\}/i.test(trimmed)) {
      outputLines.push(line);
      i++;
      continue;
    }

    // If we are already inside a [Tab] or [Tabulatur] section, output tab line directly
    if (activeSection?.type === 'tab') {
      outputLines.push(line);
      i++;
      continue;
    }

    // Check if line is a tab line and wrap consecutive tab lines in {start_of_tab} ... {end_of_tab}
    if (opts.wrapTabBlocks && isTabLine(line)) {
      const tabStart = opts.sectionDirectiveStyle === 'short' ? '{sot}' : '{start_of_tab}';
      const tabEnd = opts.sectionDirectiveStyle === 'short' ? '{eot}' : '{end_of_tab}';

      outputLines.push(tabStart);
      while (i < lines.length && isTabLine(lines[i])) {
        outputLines.push(lines[i]);
        i++;
      }
      outputLines.push(tabEnd);
      continue;
    }

    // Check if current line is a chord line
    if (isChordLine(line)) {
      // Look ahead to next non-empty line
      const nextLine = i + 1 < lines.length ? lines[i + 1] : null;

      if (nextLine !== null && nextLine.trim() !== '' && !isChordLine(nextLine) && !/^\[.+\]$/.test(nextLine.trim())) {
        // We have chords over lyrics! Weave them together.
        const woven = weaveChordsIntoLyrics(line, nextLine, opts.ignoreNC);
        outputLines.push(woven);
        i += 2; // consumed both chord line and lyrics line
        continue;
      } else {
        // Standalone chord line (e.g. Intro/Solo chords without lyrics)
        const formatted = formatStandaloneChordLine(line, opts.standaloneChordSpacing, opts.ignoreNC);
        if (formatted) {
          outputLines.push(formatted);
        }
        i++;
        continue;
      }
    }

    // Regular line (pure lyrics or already formatted ChordPro or directives)
    outputLines.push(line);
    i++;
  }

  // Close remaining open section
  if (activeSection && activeSection.end) {
    outputLines.push(activeSection.end);
  }

  // Normalize consecutive empty lines (max 1 empty line)
  const result: string[] = [];
  for (let idx = 0; idx < outputLines.length; idx++) {
    const cur = outputLines[idx];
    if (cur === '' && result.length > 0 && result[result.length - 1] === '') {
      continue;
    }
    result.push(cur);
  }

  return result.join('\n').trim() + '\n';
}
