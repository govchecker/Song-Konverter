// Hilfsfunktionen zum Bearbeiten von ChordPro-Text (Abschnitts-Tags, Titel, Untertitel).

const START_TAG = /^\s*\{\s*(?:start_of_\w+|so[a-z])\b[^}]*\}\s*$/i;
const END_TAG = /^\s*\{\s*(?:end_of_\w+|eo[a-z])\b[^}]*\}\s*$/i;

export interface TextEdit {
  text: string;
  selStart: number;
  selEnd: number;
}

/**
 * Fasst die markierten Zeilen in {start_of_<kind>} … {end_of_<kind>} ein.
 * Stehen die Zeilen schon in einem Abschnitt (oder enthält die Markierung dessen Tags),
 * werden die alten Tags entfernt und durch die neuen ersetzt.
 * Gibt null zurück, wenn nichts markiert ist; dann soll der Aufrufer die Tags einfügen.
 */
export function wrapSection(
  text: string,
  selStart: number,
  selEnd: number,
  kind: string,
  label?: string
): TextEdit | null {
  if (selStart === selEnd) return null;

  const lines = text.split('\n');
  const lineAt = (pos: number) => text.slice(0, pos).split('\n').length - 1;
  const isBlank = (i: number) => !lines[i].trim();

  let a = lineAt(selStart);
  // Endet die Markierung direkt hinter einem Zeilenumbruch, gehört die nächste Zeile nicht dazu.
  let b = lineAt(text[selEnd - 1] === '\n' ? selEnd - 1 : selEnd);
  while (a <= b && isBlank(a)) a++;
  while (b >= a && isBlank(b)) b--;
  if (a > b) return null;

  const ownStart = START_TAG.test(lines[a]);
  const ownEnd = END_TAG.test(lines[b]);

  let lo = a;
  let hi = b;
  let innerLo = a;
  let innerHi = b;
  let enclosed = false;

  if (ownStart && !ownEnd) {
    // Gegenstück weiter unten suchen und in die Auswahl aufnehmen.
    for (let j = b + 1; j < lines.length; j++) {
      if (START_TAG.test(lines[j])) break;
      if (END_TAG.test(lines[j])) {
        hi = j;
        enclosed = true;
        break;
      }
    }
  } else if (ownEnd && !ownStart) {
    for (let i = a - 1; i >= 0; i--) {
      if (END_TAG.test(lines[i])) break;
      if (START_TAG.test(lines[i])) {
        lo = i;
        enclosed = true;
        break;
      }
    }
  } else if (ownStart && ownEnd) {
    enclosed = true;
  } else {
    // Markierung liegt komplett zwischen einem Start- und End-Tag (Leerzeilen dazwischen erlaubt).
    let p = a - 1;
    while (p >= 0 && isBlank(p)) p--;
    let n = b + 1;
    while (n < lines.length && isBlank(n)) n++;
    if (p >= 0 && n < lines.length && START_TAG.test(lines[p]) && END_TAG.test(lines[n])) {
      lo = p;
      hi = n;
      enclosed = true;
    }
  }

  if (enclosed) {
    innerLo = lo + 1;
    innerHi = hi - 1;
    if (innerLo > innerHi || lines.slice(innerLo, innerHi + 1).every((l) => !l.trim())) return null;
  }

  const open = `{start_of_${kind}${label ? `: ${label}` : ''}}`;
  const close = `{end_of_${kind}}`;
  const block = [open, ...lines.slice(innerLo, innerHi + 1), close].join('\n');

  const before = lines.slice(0, lo).join('\n');
  const after = lines.slice(hi + 1).join('\n');
  const prefix = lo > 0 ? before + '\n' : '';
  const result = prefix + block + (hi + 1 < lines.length ? '\n' + after : '');
  return { text: result, selStart: prefix.length, selEnd: prefix.length + block.length };
}

export type DirectiveName = 'title' | 'subtitle' | 'artist';

const ALIASES: Record<DirectiveName, string[]> = {
  title: ['title', 't'],
  subtitle: ['subtitle', 'st'],
  artist: ['artist'],
};

const directiveRegex = (name: DirectiveName) =>
  new RegExp(`^[ \\t]*\\{\\s*(?:${ALIASES[name].join('|')})\\s*:\\s*(.*?)\\s*\\}[ \\t]*$`, 'mi');

export function getDirective(text: string, name: DirectiveName): string {
  return text.match(directiveRegex(name))?.[1] ?? '';
}

/** Setzt {title: …}, {subtitle: …} bzw. {artist: …}; leerer Wert entfernt die Zeile. */
export function setDirective(text: string, name: DirectiveName, value: string): string {
  const re = directiveRegex(name);
  const line = `{${name}: ${value}}`;
  if (re.test(text)) {
    if (value) return text.replace(re, () => line);
    return text.replace(new RegExp(re.source + '\\n?', 'mi'), '');
  }
  if (!value) return text;

  if (name !== 'title') {
    // Untertitel und Interpret kommen direkt unter den Titel bzw. den Untertitel.
    const m =
      (name === 'artist' && text.match(directiveRegex('subtitle'))) || text.match(directiveRegex('title'));
    if (m && m.index !== undefined) {
      const end = m.index + m[0].length;
      return text.slice(0, end) + '\n' + line + text.slice(end);
    }
  }
  return line + '\n' + text;
}
