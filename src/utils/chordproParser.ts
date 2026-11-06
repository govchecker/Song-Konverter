export type SectionType = 'verse' | 'chorus' | 'bridge' | 'part';

export interface ParsedLine {
  type: 'meta' | 'section-start' | 'section-end' | 'comment' | 'lyrics' | 'empty' | 'tab';
  content?: string;
  sectionType?: SectionType;
  sectionName?: string;
  tokens?: Array<{ chord?: string; text: string }>;
  tabLines?: string[];
}

export interface ParsedSong {
  title: string;
  subtitle: string;
  artist: string;
  key: string;
  capo: string;
  tempo: string;
  time: string;
  lines: ParsedLine[];
}

/**
 * Liest ChordPro-Text ein. Gemeinsam genutzt von der Vorschau und vom PDF-Export.
 * Neue oder umbenannte Direktiven aus dem Konverter müssen hier ergänzt werden.
 */
export function parseChordPro(chordProText: string): ParsedSong {
  const lines = chordProText.split(/\r?\n/);

  let title = '';
  let subtitle = '';
  let artist = '';
  let key = '';
  let capo = '';
  let tempo = '';
  let time = '';

  const parsed: ParsedLine[] = [];
  let currentSection: { type: SectionType; name: string } | null = null;
  // Zuletzt vollständig definierter Chorus (start_of_chorus … end_of_chorus), für {chorus}
  let chorusStart: number | null = null;
  let lastChorus: ParsedLine[] | null = null;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const trimmed = line.trim();

    if (!trimmed) {
      parsed.push({ type: 'empty' });
      continue;
    }

    // Directives
    const directiveMatch = trimmed.match(/^\{([a-zA-Z0-9_]+)(?:\s*:\s*([^}]+))?\}$/);
    if (directiveMatch) {
      const tag = directiveMatch[1].toLowerCase();
      const val = (directiveMatch[2] || '').trim();

      if (tag === 'title' || tag === 't') {
        title = val;
        continue;
      }
      if (tag === 'subtitle' || tag === 'st') {
        subtitle = val;
        continue;
      }
      if (tag === 'artist' || tag === 'a') {
        artist = val;
        continue;
      }
      if (tag === 'key' || tag === 'k') {
        key = val;
        continue;
      }
      if (tag === 'capo') {
        capo = val;
        continue;
      }
      if (tag === 'tempo') {
        tempo = val;
        continue;
      }
      if (tag === 'time') {
        time = val;
        continue;
      }

      // Sections
      if (tag === 'start_of_verse' || tag === 'sov') {
        currentSection = { type: 'verse', name: val || 'Verse' };
        parsed.push({ type: 'section-start', sectionType: 'verse', sectionName: currentSection.name });
        continue;
      }
      if (tag === 'end_of_verse' || tag === 'eov') {
        parsed.push({ type: 'section-end', sectionType: 'verse' });
        currentSection = null;
        continue;
      }

      if (tag === 'start_of_chorus' || tag === 'soc') {
        currentSection = { type: 'chorus', name: val || 'Chorus' };
        chorusStart = parsed.length;
        parsed.push({ type: 'section-start', sectionType: 'chorus', sectionName: currentSection.name });
        continue;
      }
      if (tag === 'end_of_chorus' || tag === 'eoc') {
        parsed.push({ type: 'section-end', sectionType: 'chorus' });
        if (chorusStart !== null) {
          lastChorus = parsed.slice(chorusStart);
          chorusStart = null;
        }
        currentSection = null;
        continue;
      }

      // {chorus} / {chorus: Label}: zuletzt definierten Chorus an dieser Stelle wiederholen
      if (tag === 'chorus') {
        if (!lastChorus) {
          parsed.push({ type: 'comment', content: 'Chorus (noch kein Chorus definiert)' });
        } else {
          const copy = lastChorus.map(l => ({ ...l }));
          if (val && copy[0]?.type === 'section-start') copy[0].sectionName = val;
          parsed.push(...copy);
        }
        continue;
      }

      if (tag === 'start_of_bridge' || tag === 'sob') {
        currentSection = { type: 'bridge', name: val || 'Bridge' };
        parsed.push({ type: 'section-start', sectionType: 'bridge', sectionName: currentSection.name });
        continue;
      }
      if (tag === 'end_of_bridge' || tag === 'eob') {
        parsed.push({ type: 'section-end', sectionType: 'bridge' });
        currentSection = null;
        continue;
      }

      if (tag === 'start_of_part' || tag === 'sop') {
        currentSection = { type: 'part', name: val || 'Teil' };
        parsed.push({ type: 'section-start', sectionType: 'part', sectionName: currentSection.name });
        continue;
      }
      if (tag === 'end_of_part' || tag === 'eop') {
        parsed.push({ type: 'section-end', sectionType: 'part' });
        currentSection = null;
        continue;
      }

      // Tabulatur directives
      if (tag === 'start_of_tab' || tag === 'sot') {
        const tabLines: string[] = [];
        lineIdx++;
        while (lineIdx < lines.length) {
          const nextRaw = lines[lineIdx];
          const nextTrim = nextRaw.trim();
          if (/^\{(end_of_tab|eot)\}/i.test(nextTrim)) {
            break;
          }
          if (/^\{[a-z_]+/i.test(nextTrim) && !/^\{(end_of_tab|eot)\}/i.test(nextTrim)) {
            lineIdx--;
            break;
          }
          tabLines.push(nextRaw);
          lineIdx++;
        }
        parsed.push({ type: 'tab', tabLines });
        continue;
      }
      if (tag === 'end_of_tab' || tag === 'eot') {
        continue;
      }

      if (tag === 'comment' || tag === 'c') {
        parsed.push({ type: 'comment', content: val });
        continue;
      }

      // Other meta directive
      parsed.push({ type: 'meta', content: `${tag}: ${val}` });
      continue;
    }

    // Lyrics with chords [Chord]
    const tokenRegex = /\[([^\]]+)\]|([^\[]+)/g;
    const tokens: Array<{ chord?: string; text: string }> = [];
    let match: RegExpExecArray | null;
    let pendingChord: string | undefined = undefined;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match[1] !== undefined) {
        // We found a chord [XYZ]
        if (pendingChord) {
          tokens.push({ chord: pendingChord, text: '' });
        }
        pendingChord = match[1];
      } else if (match[2] !== undefined) {
        // Text chunk
        tokens.push({ chord: pendingChord, text: match[2] });
        pendingChord = undefined;
      }
    }

    if (pendingChord) {
      tokens.push({ chord: pendingChord, text: '' });
    }

    parsed.push({ type: 'lyrics', tokens });
  }

  return { title, subtitle, artist, key, capo, tempo, time, lines: parsed };
}
