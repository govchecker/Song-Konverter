import React from 'react';
import {
  Copy,
  Download,
  Check,
  Music2,
  FileText,
  Eye,
  Code,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface ChordProToolbarProps {
  viewMode: 'code' | 'preview';
  onViewModeChange: (mode: 'code' | 'preview') => void;
  onInsertDirective: (text: string) => void;
  onTranspose: (semitones: number) => void;
  onCopy: () => void;
  isCopied: boolean;
  onDownload: (ext: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  downloadExt: string;
  setDownloadExt: (ext: string) => void;
}

export const ChordProToolbar: React.FC<ChordProToolbarProps> = ({
  viewMode,
  onViewModeChange,
  onInsertDirective,
  onTranspose,
  onCopy,
  isCopied,
  onDownload,
  fontSize,
  onFontSizeChange,
  downloadExt,
  setDownloadExt,
}) => {
  return (
    <div className="flex flex-col gap-2 p-3 bg-stone-900 border-b border-stone-800 text-stone-200">
      {/* Top Row: Mode Switcher & Major Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* View Switcher: Code vs MobileSheets Sheet View */}
        <div className="flex items-center bg-stone-950 p-1 rounded-lg border border-stone-800">
          <button
            type="button"
            onClick={() => onViewModeChange('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              viewMode === 'code'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            ChordPro Code
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              viewMode === 'preview'
                ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            MobileSheets Vorschau
          </button>
        </div>

        {/* Transpose Controls */}
        <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs">
          <span className="text-stone-400 mr-1 text-[11px] font-mono">Transponieren:</span>
          <button
            type="button"
            onClick={() => onTranspose(-1)}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 active:scale-95 rounded text-amber-300 font-bold font-mono transition"
            title="Halbton tiefer (-1)"
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => onTranspose(1)}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 active:scale-95 rounded text-amber-300 font-bold font-mono transition"
            title="Halbton höher (+1)"
          >
            +1
          </button>
        </div>

        {/* Zoom Controls for Sheet View */}
        {viewMode === 'preview' && (
          <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs">
            <span className="text-stone-400 text-[11px]">Schrift:</span>
            <button
              type="button"
              onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
              className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-300"
              title="Schrift kleiner"
            >
              A-
            </button>
            <span className="text-stone-400 text-[10px] w-6 text-center">{fontSize}</span>
            <button
              type="button"
              onClick={() => onFontSizeChange(Math.min(26, fontSize + 2))}
              className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-300"
              title="Schrift größer"
            >
              A+
            </button>
          </div>
        )}

        {/* Action Buttons: Copy & Download */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            type="button"
            onClick={onCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer border ${
              isCopied
                ? 'bg-emerald-600 text-stone-950 border-emerald-500 font-bold'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
            title="ChordPro-Text in die Zwischenablage kopieren"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? 'Kopiert!' : 'Kopieren'}
          </button>

          {/* Download dropdown / button */}
          <div className="flex items-center bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg shadow-sm border border-amber-500 transition active:scale-95">
            <button
              type="button"
              onClick={() => onDownload(downloadExt)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
              title="Als ChordPro-Datei für MobileSheets speichern"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Speichern</span>
            </button>
            <select
              value={downloadExt}
              onChange={(e) => setDownloadExt(e.target.value)}
              className="bg-amber-700 text-stone-950 font-mono text-[11px] font-bold py-1.5 pr-2 pl-1 rounded-r-lg border-l border-amber-500/50 cursor-pointer focus:outline-none"
              title="Dateiendung wählen"
            >
              <option value="chordpro">.chordpro</option>
              <option value="cho">.cho</option>
              <option value="pro">.pro</option>
              <option value="txt">.txt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Insert Helpers (Visible in code mode) */}
      {viewMode === 'code' && (
        <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-stone-800 text-[11px] overflow-x-auto">
          <span className="text-stone-400 mr-1 text-[10px] uppercase font-semibold">Einfügen:</span>
          <button
            type="button"
            onClick={() => onInsertDirective('{start_of_verse: Verse}\n\n{end_of_verse}')}
            className="px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-sky-400 border border-stone-700/60 font-mono cursor-pointer"
          >
            + Verse
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{start_of_chorus: Chorus}\n\n{end_of_chorus}')}
            className="px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-amber-400 border border-stone-700/60 font-mono cursor-pointer"
          >
            + Chorus
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{start_of_bridge: Bridge}\n\n{end_of_bridge}')}
            className="px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-purple-400 border border-stone-700/60 font-mono cursor-pointer"
          >
            + Bridge
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{start_of_part: Solo}\n\n{end_of_part}')}
            className="px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-emerald-400 border border-stone-700/60 font-mono cursor-pointer"
          >
            + Solo / Part
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{start_of_tab}\n\n{end_of_tab}')}
            className="px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-teal-400 border border-stone-700/60 font-mono cursor-pointer"
            title="Tabulatur-Block {start_of_tab} ... {end_of_tab} einfügen"
          >
            + Tab
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{comment: }')}
            className="px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60 font-mono cursor-pointer"
          >
            + Kommentar
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('[]')}
            className="px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-amber-300 border border-stone-700/60 font-mono font-bold cursor-pointer"
          >
            + [Akkord]
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{key: }')}
            className="px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60 font-mono cursor-pointer"
          >
            + Tonart
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{capo: }')}
            className="px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60 font-mono cursor-pointer"
          >
            + Capo
          </button>
        </div>
      )}
    </div>
  );
};
