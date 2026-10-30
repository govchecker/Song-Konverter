/**
 * Musical note & chord transposer for ChordPro text
 */

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_TO_INDEX: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
  'H': 11, // German H = B
};

/**
 * Transposes a single note by semitones
 */
export function transposeNote(note: string, semitones: number, preferFlats = false): string {
  const upper = note.toUpperCase();
  const baseIndex = NOTE_TO_INDEX[upper];
  if (baseIndex === undefined) return note;

  const newIndex = (baseIndex + semitones + 1200) % 12;
  return preferFlats ? NOTES_FLAT[newIndex] : NOTES_SHARP[newIndex];
}

/**
 * Transposes a single chord string (e.g. "Em7", "C#m/G#", "Bbmaj9")
 */
export function transposeChord(chord: string, semitones: number, preferFlats = false): string {
  if (chord === 'N.C.' || chord === 'NC') return chord;

  // Match root note and bass note
  const chordRegex = /^([A-G][b#]?|[Hh][b#]?)(.*?)(\/([A-G][b#]?|[Hh][b#]?))?$/;
  const match = chord.match(chordRegex);
  if (!match) return chord;

  const root = match[1];
  const quality = match[2] || '';
  const slash = match[3];
  const bass = match[4];

  const transposedRoot = transposeNote(root, semitones, preferFlats);
  let transposedBass = '';
  if (slash && bass) {
    transposedBass = '/' + transposeNote(bass, semitones, preferFlats);
  }

  return `${transposedRoot}${quality}${transposedBass}`;
}

/**
 * Transposes all chords in a ChordPro text document
 */
export function transposeChordPro(chordProText: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return chordProText;

  // Replace chords in brackets [Chord]
  let result = chordProText.replace(/\[([A-G][b#]?[^\]]*|[Hh][b#]?[^\]]*)\]/g, (match, chord) => {
    return `[${transposeChord(chord, semitones, preferFlats)}]`;
  });

  // Also transpose {key: ...} directive if present
  result = result.replace(/^(\{key\s*:\s*)([A-G][b#]?[^}\s]*|[Hh][b#]?[^}\s]*)(\})/gmi, (match, prefix, keyNote, suffix) => {
    return `${prefix}${transposeChord(keyNote, semitones, preferFlats)}${suffix}`;
  });

  return result;
}
