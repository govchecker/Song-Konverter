import React from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { ConverterOptions } from '../utils/chordproConverter';

interface ConversionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ConverterOptions;
  onChangeOptions: (newOpts: ConverterOptions) => void;
}

export const ConversionSettingsModal: React.FC<ConversionSettingsModalProps> = ({
  isOpen,
  onClose,
  options,
  onChangeOptions,
}) => {
  if (!isOpen) return null;

  const update = (partial: Partial<ConverterOptions>) => {
    onChangeOptions({ ...options, ...partial });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-navy-800 border border-navy-650 rounded-xl shadow-2xl shadow-navy-950/60 p-6 text-navy-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between -mx-6 -mt-6 px-6 py-3.5 mb-5 bg-navy-950">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent-soft" />
            <h2 className="text-base font-bold text-white">Konvertierungs-Optionen</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-navy-300 hover:text-white hover:bg-navy-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="space-y-4 text-xs">
          {/* Directive Style */}
          <div>
            <label className="block font-semibold text-navy-200 mb-1.5">
              Abschnitt-Direktiven (Songabschnitte)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => update({ sectionDirectiveStyle: 'full' })}
                className={`p-2.5 rounded-md border text-left cursor-pointer transition ${
                  options.sectionDirectiveStyle === 'full'
                    ? 'border-accent bg-accent/15 text-accent-soft font-bold'
                    : 'border-navy-650 bg-navy-825 text-navy-300 hover:border-navy-600'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">MobileSheets Standard</div>
                <div className="text-[10px] text-navy-300 font-mono">{"{start_of_verse}"}</div>
              </button>

              <button
                type="button"
                onClick={() => update({ sectionDirectiveStyle: 'short' })}
                className={`p-2.5 rounded-md border text-left cursor-pointer transition ${
                  options.sectionDirectiveStyle === 'short'
                    ? 'border-accent bg-accent/15 text-accent-soft font-bold'
                    : 'border-navy-650 bg-navy-825 text-navy-300 hover:border-navy-600'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Kurzform</div>
                <div className="text-[10px] text-navy-300 font-mono">{"{sov}"} / {"{soc}"}</div>
              </button>

              <button
                type="button"
                onClick={() => update({ sectionDirectiveStyle: 'comment' })}
                className={`p-2.5 rounded-md border text-left cursor-pointer transition ${
                  options.sectionDirectiveStyle === 'comment'
                    ? 'border-accent bg-accent/15 text-accent-soft font-bold'
                    : 'border-navy-650 bg-navy-825 text-navy-300 hover:border-navy-600'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Nur Kommentare</div>
                <div className="text-[10px] text-navy-300 font-mono">{"{comment: Verse}"}</div>
              </button>
            </div>
          </div>

          {/* Standalone Chord Spacing */}
          <div>
            <label className="block font-semibold text-navy-200 mb-1.5">
              Akkorde auf reinen Akkordzeilen (z. B. Intro / Solo)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ standaloneChordSpacing: 'compact' })}
                className={`p-2.5 rounded-md border text-left cursor-pointer transition ${
                  options.standaloneChordSpacing === 'compact'
                    ? 'border-accent bg-accent/15 text-accent-soft font-bold'
                    : 'border-navy-650 bg-navy-825 text-navy-300 hover:border-navy-600'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Kompakt (Empfohlen)</div>
                <div className="text-[10px] text-navy-300 font-mono">[Em][Em7][Cmaj7]</div>
              </button>

              <button
                type="button"
                onClick={() => update({ standaloneChordSpacing: 'spaced' })}
                className={`p-2.5 rounded-md border text-left cursor-pointer transition ${
                  options.standaloneChordSpacing === 'spaced'
                    ? 'border-accent bg-accent/15 text-accent-soft font-bold'
                    : 'border-navy-650 bg-navy-825 text-navy-300 hover:border-navy-600'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Mit Leerzeichen</div>
                <div className="text-[10px] text-navy-300 font-mono">[Em] [Em7] [Cmaj7]</div>
              </button>
            </div>
          </div>

          {/* Metadata Detection */}
          <div className="pt-2 border-t border-navy-650">
            <label className="block font-semibold text-navy-200 mb-1.5">
              Titel- und Interpret-Erkennung in Zeile 1
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ titleArtistOrder: 'artist-title' })}
                className={`p-2.5 rounded-md border text-left cursor-pointer transition ${
                  options.titleArtistOrder === 'artist-title'
                    ? 'border-accent bg-accent/15 text-accent-soft font-bold'
                    : 'border-navy-650 bg-navy-825 text-navy-300 hover:border-navy-600'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Interpret - Titel</div>
                <div className="text-[10px] text-navy-300 font-mono">z. B. "Incubus - Drive"</div>
              </button>

              <button
                type="button"
                onClick={() => update({ titleArtistOrder: 'title-artist' })}
                className={`p-2.5 rounded-md border text-left cursor-pointer transition ${
                  options.titleArtistOrder === 'title-artist'
                    ? 'border-accent bg-accent/15 text-accent-soft font-bold'
                    : 'border-navy-650 bg-navy-825 text-navy-300 hover:border-navy-600'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Titel - Interpret</div>
                <div className="text-[10px] text-navy-300 font-mono">z. B. "Drive - Incubus"</div>
              </button>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="pt-2 border-t border-navy-650 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.ignoreNC}
                onChange={(e) => update({ ignoreNC: e.target.checked })}
                className="accent-accent cursor-pointer"
              />
              <span className="text-navy-200">
                <strong>N.C. (No Chord) ausblenden</strong> (standardmäßig eingeblendet, hier optional ausblendbar)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.detectMetadata}
                onChange={(e) => update({ detectMetadata: e.target.checked })}
                className="accent-accent cursor-pointer"
              />
              <span className="text-navy-200">
                <strong>Automatische Metadaten-Erkennung</strong> (Titel, Interpret, Capo, Key)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.wrapTabBlocks ?? true}
                onChange={(e) => update({ wrapTabBlocks: e.target.checked })}
                className="accent-accent cursor-pointer"
              />
              <span className="text-navy-200">
                <strong>Tabulaturen automatisch erkennen</strong> und in <code className="text-chord font-mono">{"{start_of_tab}"}</code> einbetten
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-md shadow-sm shadow-accent/35 text-xs transition cursor-pointer"
          >
            Übernehmen & Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
