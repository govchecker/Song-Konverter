import React from 'react';
import { parseChordPro } from '../utils/chordproParser';

interface MobileSheetsPreviewProps {
  chordProText: string;
  fontSize: number;
}

export const MobileSheetsPreview: React.FC<MobileSheetsPreviewProps> = ({
  chordProText,
  fontSize,
}) => {
  const {
    title: songTitle,
    subtitle: songSubtitle,
    artist: songArtist,
    key: songKey,
    capo: songCapo,
    tempo: songTempo,
    time: songTime,
    lines: parsedLines,
  } = parseChordPro(chordProText);

  return (
    <div
      className="p-6 md:p-8 bg-navy-800 text-navy-100 rounded-xl font-song overflow-auto selection:bg-accent selection:text-white border border-navy-650"
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Header Info */}
      <div className="border-b border-navy-650 pb-4 mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          {songTitle || 'Unbenannter Song'}
        </h1>
        {songSubtitle && (
          <p className="text-navy-200 text-base mt-0.5">{songSubtitle}</p>
        )}
        {songArtist && (
          <p className="text-navy-300 font-medium text-lg mt-0.5">Interpret: {songArtist}</p>
        )}

        {/* Metadata Badges */}
        {(songKey || songCapo || songTempo || songTime) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs">
            {songKey && (
              <span className="px-2.5 py-1 rounded-md bg-blue-400/18 text-accent-soft">
                Tonart: <strong>{songKey}</strong>
              </span>
            )}
            {songCapo && (
              <span className="px-2.5 py-1 rounded-md bg-cat-verse/14 text-cat-verse">
                Capo: <strong>{songCapo}</strong>
              </span>
            )}
            {songTempo && (
              <span className="px-2.5 py-1 rounded-md bg-cat-part/14 text-cat-part">
                Tempo: <strong>{songTempo} BPM</strong>
              </span>
            )}
            {songTime && (
              <span className="px-2.5 py-1 rounded-md bg-cat-bridge/14 text-cat-bridge">
                Takt: <strong>{songTime}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Rendered Song Lines */}
      <div className="space-y-1.5 leading-relaxed">
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
                className={`inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md mt-3 mb-1 ${styles}`}
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
              <div key={idx} className="text-navy-300 italic text-sm my-1 pl-2 border-l-2 border-navy-600">
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
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-chord uppercase tracking-widest mb-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-chord" />
                  <span>Tabulatur (Monospace)</span>
                </div>
                <pre className="font-song-mono text-xs md:text-sm leading-snug tracking-wider text-code whitespace-pre font-normal select-text">
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
                        className="text-chord font-bold"
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
                  <span
                    key={tIdx}
                    className="inline-flex flex-col"
                    // Ist der Text kürzer als der Akkord, einen Abstand zum nächsten Akkord lassen
                    style={token.chord && token.text.length <= token.chord.length + 1 ? { paddingRight: '.6em' } : undefined}
                  >
                    {/* Chord displayed on top - styled normally like in MobileSheets */}
                    <span className="text-chord font-bold min-h-[1.25em] leading-none select-text">
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
