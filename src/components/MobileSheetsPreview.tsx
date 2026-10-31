import React from 'react';

interface MobileSheetsPreviewProps {
  chordProText: string;
  fontSize: number;
}

interface ParsedLine {
  type: 'meta' | 'section-start' | 'section-end' | 'comment' | 'lyrics' | 'empty' | 'tab';
  content?: string;
  sectionType?: 'verse' | 'chorus' | 'bridge' | 'part';
  sectionName?: string;
  tokens?: Array<{ chord?: string; text: string }>;
  tabLines?: string[];
}

export const MobileSheetsPreview: React.FC<MobileSheetsPreviewProps> = ({
  chordProText,
  fontSize,
}) => {
  // Parse lines of chordpro text
  const lines = chordProText.split(/\r?\n/);

  let songTitle = '';
  let songArtist = '';
  let songKey = '';
  let songCapo = '';
  let songTempo = '';
  let songTime = '';

  const parsedLines: ParsedLine[] = [];
  let currentSection: { type: 'verse' | 'chorus' | 'bridge' | 'part'; name: string } | null = null;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const trimmed = line.trim();

    if (!trimmed) {
      parsedLines.push({ type: 'empty' });
      continue;
    }

    // Directives
    const directiveMatch = trimmed.match(/^\{([a-zA-Z0-9_]+)(?:\s*:\s*([^}]+))?\}$/);
    if (directiveMatch) {
      const tag = directiveMatch[1].toLowerCase();
      const val = (directiveMatch[2] || '').trim();

      if (tag === 'title' || tag === 't') {
        songTitle = val;
        continue;
      }
      if (tag === 'artist' || tag === 'a') {
        songArtist = val;
        continue;
      }
      if (tag === 'key' || tag === 'k') {
        songKey = val;
        continue;
      }
      if (tag === 'capo') {
        songCapo = val;
        continue;
      }
      if (tag === 'tempo') {
        songTempo = val;
        continue;
      }
      if (tag === 'time') {
        songTime = val;
        continue;
      }

      // Sections
      if (tag === 'start_of_verse' || tag === 'sov') {
        currentSection = { type: 'verse', name: val || 'Verse' };
        parsedLines.push({ type: 'section-start', sectionType: 'verse', sectionName: currentSection.name });
        continue;
      }
      if (tag === 'end_of_verse' || tag === 'eov') {
        parsedLines.push({ type: 'section-end', sectionType: 'verse' });
        currentSection = null;
        continue;
      }

      if (tag === 'start_of_chorus' || tag === 'soc') {
        currentSection = { type: 'chorus', name: val || 'Chorus' };
        parsedLines.push({ type: 'section-start', sectionType: 'chorus', sectionName: currentSection.name });
        continue;
      }
      if (tag === 'end_of_chorus' || tag === 'eoc') {
        parsedLines.push({ type: 'section-end', sectionType: 'chorus' });
        currentSection = null;
        continue;
      }

      if (tag === 'start_of_bridge' || tag === 'sob') {
        currentSection = { type: 'bridge', name: val || 'Bridge' };
        parsedLines.push({ type: 'section-start', sectionType: 'bridge', sectionName: currentSection.name });
        continue;
      }
      if (tag === 'end_of_bridge' || tag === 'eob') {
        parsedLines.push({ type: 'section-end', sectionType: 'bridge' });
        currentSection = null;
        continue;
      }

      if (tag === 'start_of_part' || tag === 'sop') {
        currentSection = { type: 'part', name: val || 'Teil' };
        parsedLines.push({ type: 'section-start', sectionType: 'part', sectionName: currentSection.name });
        continue;
      }
      if (tag === 'end_of_part' || tag === 'eop') {
        parsedLines.push({ type: 'section-end', sectionType: 'part' });
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
        parsedLines.push({ type: 'tab', tabLines });
        continue;
      }
      if (tag === 'end_of_tab' || tag === 'eot') {
        continue;
      }

      if (tag === 'comment' || tag === 'c') {
        parsedLines.push({ type: 'comment', content: val });
        continue;
      }

      // Other meta directive
      parsedLines.push({ type: 'meta', content: `${tag}: ${val}` });
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

    parsedLines.push({ type: 'lyrics', tokens });
  }

  return (
    <div
      className="p-6 md:p-8 bg-navy-800 text-navy-100 rounded-xl font-sans overflow-auto selection:bg-accent selection:text-white border border-navy-650"
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Header Info */}
      <div className="border-b border-navy-650 pb-4 mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          {songTitle || 'Unbenannter Song'}
        </h1>
        {songArtist && (
          <p className="text-navy-300 font-medium text-lg mt-0.5">{songArtist}</p>
        )}

        {/* Metadata Badges */}
        {(songKey || songCapo || songTempo || songTime) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs">
            {songKey && (
              <span className="px-2.5 py-1 rounded-md bg-blue-400/18 text-accent-soft font-mono">
                Tonart: <strong>{songKey}</strong>
              </span>
            )}
            {songCapo && (
              <span className="px-2.5 py-1 rounded-md bg-cat-verse/14 text-cat-verse">
                Capo: <strong>{songCapo}</strong>
              </span>
            )}
            {songTempo && (
              <span className="px-2.5 py-1 rounded-md bg-cat-part/14 text-cat-part font-mono">
                Tempo: <strong>{songTempo} BPM</strong>
              </span>
            )}
            {songTime && (
              <span className="px-2.5 py-1 rounded-md bg-cat-bridge/14 text-cat-bridge font-mono">
                Takt: <strong>{songTime}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Rendered Song Lines */}
      <div className="space-y-1.5 font-mono leading-relaxed">
        {parsedLines.map((line, idx) => {
          if (line.type === 'empty') {
            return <div key={idx} className="h-4" />;
          }

          if (line.type === 'section-start') {
            const styles = {
              verse: 'text-cat-verse bg-cat-verse/14',
              chorus: 'text-chord bg-blue-400/18 font-bold',
              bridge: 'text-cat-bridge bg-cat-bridge/14',
              part: 'text-cat-part bg-cat-part/14',
            }[line.sectionType || 'part'];

            return (
              <div
                key={idx}
                className={`inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md mt-3 mb-1 font-sans ${styles}`}
              >
                {line.sectionName}
              </div>
            );
          }

          if (line.type === 'section-end') {
            return null; // visual section separator handled by empty lines
          }

          if (line.type === 'comment') {
            return (
              <div key={idx} className="text-navy-300 italic font-sans text-sm my-1 pl-2 border-l-2 border-navy-600">
                {line.content}
              </div>
            );
          }

          if (line.type === 'tab' && line.tabLines) {
            return (
              <div
                key={idx}
                className="my-3 p-3.5 rounded-xl bg-navy-825 border border-navy-650 overflow-x-auto shadow-inner"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-chord uppercase tracking-widest mb-1.5 select-none font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-chord" />
                  <span>Tabulatur (Monospace)</span>
                </div>
                <pre className="font-mono text-xs md:text-sm leading-snug tracking-wider text-code whitespace-pre font-normal select-text">
                  {line.tabLines.join('\n')}
                </pre>
              </div>
            );
          }

          if (line.type === 'lyrics' && line.tokens) {
            // Check if this line is ONLY chords (no lyrics, e.g. Intro, Solo, Outro chords)
            const hasOnlyChords = line.tokens.every(t => !t.text.trim());

            if (hasOnlyChords) {
              return (
                <div key={idx} className="flex flex-wrap items-center gap-x-6 gap-y-1 my-1.5 py-0.5">
                  {line.tokens
                    .filter(t => t.chord)
                    .map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-chord font-bold font-mono tracking-wide"
                      >
                        {t.chord}
                      </span>
                    ))}
                </div>
              );
            }

            // Standard line with chords positioned above lyrics
            return (
              <div key={idx} className="flex flex-wrap items-end my-1">
                {line.tokens.map((token, tIdx) => (
                  <span key={tIdx} className="inline-flex flex-col">
                    {/* Chord displayed on top - styled normally like in MobileSheets */}
                    <span className="text-chord font-bold font-mono min-h-[1.25em] text-[0.88em] leading-none select-text">
                      {token.chord || '\u00A0'}
                    </span>
                    {/* Lyrics underneath */}
                    <span className="whitespace-pre text-navy-100">
                      {token.text || '\u00A0'}
                    </span>
                  </span>
                ))}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
