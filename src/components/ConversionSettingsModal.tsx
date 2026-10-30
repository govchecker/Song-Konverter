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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 text-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-stone-100">Konvertierungs-Optionen</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="space-y-4 text-xs">
          {/* Directive Style */}
          <div>
            <label className="block font-semibold text-stone-300 mb-1.5">
              Abschnitt-Direktiven (Songabschnitte)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => update({ sectionDirectiveStyle: 'full' })}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                  options.sectionDirectiveStyle === 'full'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">MobileSheets Standard</div>
                <div className="text-[10px] text-stone-400 font-mono">{"{start_of_verse}"}</div>
              </button>

              <button
                type="button"
                onClick={() => update({ sectionDirectiveStyle: 'short' })}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                  options.sectionDirectiveStyle === 'short'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Kurzform</div>
                <div className="text-[10px] text-stone-400 font-mono">{"{sov}"} / {"{soc}"}</div>
              </button>

              <button
                type="button"
                onClick={() => update({ sectionDirectiveStyle: 'comment' })}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                  options.sectionDirectiveStyle === 'comment'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Nur Kommentare</div>
                <div className="text-[10px] text-stone-400 font-mono">{"{comment: Verse}"}</div>
              </button>
            </div>
          </div>

          {/* Standalone Chord Spacing */}
          <div>
            <label className="block font-semibold text-stone-300 mb-1.5">
              Akkorde auf reinen Akkordzeilen (z. B. Intro / Solo)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ standaloneChordSpacing: 'compact' })}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                  options.standaloneChordSpacing === 'compact'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Kompakt (Empfohlen)</div>
                <div className="text-[10px] text-stone-400 font-mono">[Em][Em7][Cmaj7]</div>
              </button>

              <button
                type="button"
                onClick={() => update({ standaloneChordSpacing: 'spaced' })}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                  options.standaloneChordSpacing === 'spaced'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Mit Leerzeichen</div>
                <div className="text-[10px] text-stone-400 font-mono">[Em] [Em7] [Cmaj7]</div>
              </button>
            </div>
          </div>

          {/* Metadata Detection */}
          <div className="pt-2 border-t border-stone-800/80">
            <label className="block font-semibold text-stone-300 mb-1.5">
              Titel- und Interpret-Erkennung in Zeile 1
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update({ titleArtistOrder: 'artist-title' })}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                  options.titleArtistOrder === 'artist-title'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Interpret - Titel</div>
                <div className="text-[10px] text-stone-400 font-mono">z. B. "Incubus - Drive"</div>
              </button>

              <button
                type="button"
                onClick={() => update({ titleArtistOrder: 'title-artist' })}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                  options.titleArtistOrder === 'title-artist'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">Titel - Interpret</div>
                <div className="text-[10px] text-stone-400 font-mono">z. B. "Drive - Incubus"</div>
              </button>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="pt-2 border-t border-stone-800/80 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.ignoreNC}
                onChange={(e) => update({ ignoreNC: e.target.checked })}
                className="rounded border-stone-700 text-amber-600 focus:ring-amber-500 bg-stone-950"
              />
              <span className="text-stone-300">
                <strong>N.C. (No Chord) ausblenden</strong> (standardmäßig eingeblendet, hier optional ausblendbar)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.detectMetadata}
                onChange={(e) => update({ detectMetadata: e.target.checked })}
                className="rounded border-stone-700 text-amber-600 focus:ring-amber-500 bg-stone-950"
              />
              <span className="text-stone-300">
                <strong>Automatische Metadaten-Erkennung</strong> (Titel, Interpret, Capo, Key)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={options.wrapTabBlocks ?? true}
                onChange={(e) => update({ wrapTabBlocks: e.target.checked })}
                className="rounded border-stone-700 text-amber-600 focus:ring-amber-500 bg-stone-950"
              />
              <span className="text-stone-300">
                <strong>Tabulaturen automatisch erkennen</strong> und in <code className="text-amber-400 font-mono">{"{start_of_tab}"}</code> einbetten
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Übernehmen & Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
