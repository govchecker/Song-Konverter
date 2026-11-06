import { parseChordPro } from './chordproParser';

/** Brücke zum Electron-Hauptprozess (siehe electron/preload.cjs). Im reinen Browser nicht vorhanden. */
declare global {
  interface Window {
    songKonverter?: {
      showPdf: (data: { html: string; title: string }) => Promise<void>;
    };
  }
}

const BLUE = '#1d4ed8';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Baut aus ChordPro-Text eine druckfähige HTML-Seite: weiß, schwarze Schrift, Überschriften und Akkorde blau. */
export function buildPdfHtml(chordProText: string, fontSize: number): string {
  const song = parseChordPro(chordProText);
  const parts: string[] = [];

  parts.push('<header>');
  parts.push(`<h1>${esc(song.title || 'Unbenannter Song')}</h1>`);
  if (song.subtitle) parts.push(`<p class="sub">${esc(song.subtitle)}</p>`);
  if (song.artist) parts.push(`<p class="artist">${esc(song.artist)}</p>`);
  const meta = [
    song.key && `Tonart: <b>${esc(song.key)}</b>`,
    song.capo && `Capo: <b>${esc(song.capo)}</b>`,
    song.tempo && `Tempo: <b>${esc(song.tempo)} BPM</b>`,
    song.time && `Takt: <b>${esc(song.time)}</b>`,
  ].filter(Boolean);
  if (meta.length) parts.push(`<p class="meta">${meta.join('<span class="sep">·</span>')}</p>`);
  parts.push('</header>');

  for (const line of song.lines) {
    if (line.type === 'empty') {
      parts.push('<div class="gap"></div>');
    } else if (line.type === 'section-start') {
      parts.push(`<div class="section">${esc(line.sectionName || '')}</div>`);
    } else if (line.type === 'comment') {
      parts.push(`<div class="comment">${esc(line.content || '')}</div>`);
    } else if (line.type === 'tab' && line.tabLines) {
      parts.push(`<pre class="tab">${esc(line.tabLines.join('\n'))}</pre>`);
    } else if (line.type === 'lyrics' && line.tokens) {
      if (line.tokens.every(t => !t.text.trim())) {
        const chords = line.tokens.filter(t => t.chord).map(t => `<span class="chord">${esc(t.chord!)}</span>`);
        parts.push(`<div class="chords-only">${chords.join('')}</div>`);
      } else {
        const cols = line.tokens.map(t => {
          // Bei proportionaler Schrift Abstand zum nächsten Akkord lassen, wenn der Text kaum länger als der Akkord ist
          const pad = t.chord && t.text.length <= t.chord.length + 1 ? ' style="padding-right:.6em"' : '';
          return `<span class="col"${pad}><span class="chord">${t.chord ? esc(t.chord) : '&nbsp;'}</span><span class="text">${t.text ? esc(t.text) : '&nbsp;'}</span></span>`;
        });
        parts.push(`<div class="line">${cols.join('')}</div>`);
      }
    }
  }

  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>${esc(song.title || 'Song')}</title>
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: #000; font-family: 'Adwaita Sans', 'Cantarell', 'Inter', 'DejaVu Sans', sans-serif; font-size: ${fontSize}px; line-height: 1.45; }
  header { text-align: center; border-bottom: 1px solid #c7d2e6; padding-bottom: 10px; margin-bottom: 14px;}
  h1 { margin: 0; font-size: 1.7em; color: ${BLUE}; }
  header p { margin: 2px 0 0; }
  .sub { font-size: 1.05em; }
  .artist { font-size: 1.15em; font-weight: 600; }
  .meta { margin-top: 8px; font-size: .8em; color: #333; }
  .sep { margin: 0 .6em; color: #999; }
  .gap { height: 1em; }
  .section { display: block; margin: .8em 0 .25em; color: ${BLUE}; font-weight: 700; font-size: .85em; text-transform: uppercase; letter-spacing: .06em; break-after: avoid; }
  .comment { margin: .3em 0; padding-left: .6em; border-left: 2px solid #999; font-style: italic; color: #333; font-size: .9em; }
  .line { display: flex; flex-wrap: wrap; align-items: flex-end; margin: .2em 0; break-inside: avoid; }
  .col { display: inline-flex; flex-direction: column; }
  .chord { color: ${BLUE}; font-weight: 700; line-height: 1.2; min-height: 1.2em; }
  .text { white-space: pre; }
  .chords-only { display: flex; flex-wrap: wrap; gap: .25em 1.6em; margin: .3em 0; break-inside: avoid; }
  .tab { margin: .6em 0; padding: .5em .7em; border: 1px solid #c7d2e6; border-radius: 4px; font-family: 'Adwaita Mono', 'DejaVu Sans Mono', 'Liberation Mono', monospace; font-size: .8em; line-height: 1.25; white-space: pre; overflow: hidden; break-inside: avoid; }
</style></head><body>
${parts.join('\n')}
</body></html>`;
}

export function dateinameFuerPdf(chordProText: string): string {
  const { title, artist } = parseChordPro(chordProText);
  const name = [artist, title].filter(Boolean).join(' - ') || 'Song';
  return name.replace(/[\\/:*?"<>|]+/g, '_').trim();
}

/** Zeigt den Song als PDF in einem eigenen Fenster an. Gibt false zurück, wenn die App-Brücke fehlt (Browser). */
export async function showSongAsPdf(chordProText: string, fontSize: number): Promise<boolean> {
  if (!window.songKonverter) return false;
  await window.songKonverter.showPdf({
    html: buildPdfHtml(chordProText, fontSize),
    title: dateinameFuerPdf(chordProText),
  });
  return true;
}
