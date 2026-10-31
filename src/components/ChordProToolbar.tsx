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
    <div className="flex flex-col text-navy-200">
      {/* Top Row: Mode Switcher & Major Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-navy-950">
        {/* View Switcher: Code vs MobileSheets Sheet View */}
        <div className="flex items-center bg-navy-825 p-1 rounded-lg border border-navy-650">
          <button
            type="button"
            onClick={() => onViewModeChange('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition ${
              viewMode === 'code'
                ? 'bg-accent text-white font-bold shadow-sm shadow-accent/35'
                : 'text-navy-300 hover:text-navy-100'
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
                ? 'bg-accent text-white font-bold shadow-sm shadow-accent/35'
                : 'text-navy-300 hover:text-navy-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            MobileSheets Vorschau
          </button>
        </div>

        {/* Transpose Controls */}
        <div className="flex items-center gap-1 bg-navy-825 px-2 py-1 rounded-lg border border-navy-650 text-xs">
          <span className="text-navy-300 mr-1 text-[11px]">Transponieren</span>
          <button
            type="button"
            onClick={() => onTranspose(-1)}
            className="px-2 py-1 bg-blue-400/18 hover:bg-blue-400/30 active:scale-95 rounded-md text-accent-soft font-bold font-mono transition"
            title="Halbton tiefer (-1)"
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => onTranspose(1)}
            className="px-2 py-1 bg-blue-400/18 hover:bg-blue-400/30 active:scale-95 rounded-md text-accent-soft font-bold font-mono transition"
            title="Halbton höher (+1)"
          >
            +1
          </button>
        </div>

        {/* Zoom Controls for Sheet View */}
        {viewMode === 'preview' && (
          <div className="flex items-center gap-1 bg-navy-825 px-2 py-1 rounded-lg border border-navy-650 text-xs">
            <span className="text-navy-300 text-[11px]">Schrift</span>
            <button
              type="button"
              onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
              className="px-2 py-0.5 bg-blue-400/18 hover:bg-blue-400/30 rounded-md text-accent-soft transition"
              title="Schrift kleiner"
            >
              A-
            </button>
            <span className="text-navy-300 text-[10px] w-6 text-center">{fontSize}</span>
            <button
              type="button"
              onClick={() => onFontSizeChange(Math.min(26, fontSize + 2))}
              className="px-2 py-0.5 bg-blue-400/18 hover:bg-blue-400/30 rounded-md text-accent-soft transition"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition active:scale-95 cursor-pointer border ${
              isCopied
                ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                : 'bg-navy-700 hover:bg-navy-650 text-navy-200 border-navy-600'
            }`}
            title="ChordPro-Text in die Zwischenablage kopieren"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? 'Kopiert!' : 'Kopieren'}
          </button>

          {/* Download dropdown / button */}
          <div className="flex items-center bg-accent hover:bg-accent-hover text-white font-bold rounded-md shadow-sm shadow-accent/35 transition active:scale-95">
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
              className="bg-accent-hover text-white font-mono text-[11px] font-bold py-1.5 pr-2 pl-1 rounded-r-md border-l border-white/35 cursor-pointer focus:outline-none"
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
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-navy-900 border-y border-navy-950 text-[11px] overflow-x-auto">
          <span className="text-navy-300 mr-1 text-[10px] uppercase font-semibold tracking-wider">Einfügen:</span>
          <button
            type="button"
            onClick={() => onInsertDirective('{start_of_verse: Verse}\n\n{end_of_verse}')}
            className="px-2 py-0.5 rounded-md bg-cat-verse/14 hover:bg-cat-verse/24 text-cat-verse font-mono cursor-pointer transition"
          >
            + Verse
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{start_of_chorus: Chorus}\n\n{end_of_chorus}')}
            className="px-2 py-0.5 rounded-md bg-blue-400/18 hover:bg-blue-400/28 text-chord font-mono font-semibold cursor-pointer transition"
          >
            + Chorus
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{start_of_bridge: Bridge}\n\n{end_of_bridge}')}
            className="px-2 py-0.5 rounded-md bg-cat-bridge/14 hover:bg-cat-bridge/24 text-cat-bridge font-mono cursor-pointer transition"
          >
            + Bridge
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{start_of_part: Solo}\n\n{end_of_part}')}
            className="px-2 py-0.5 rounded-md bg-cat-part/14 hover:bg-cat-part/24 text-cat-part font-mono cursor-pointer transition"
          >
            + Solo / Part
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{start_of_tab}\n\n{end_of_tab}')}
            className="px-2 py-0.5 rounded-md bg-cat-part/14 hover:bg-cat-part/24 text-cat-part font-mono cursor-pointer transition"
            title="Tabulatur-Block {start_of_tab} ... {end_of_tab} einfügen"
          >
            + Tab
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{comment: }')}
            className="px-2 py-0.5 rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 border border-navy-600 font-mono cursor-pointer transition"
          >
            + Kommentar
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('[]')}
            className="px-2 py-0.5 rounded-md bg-blue-400/18 hover:bg-blue-400/28 text-chord font-mono font-bold cursor-pointer transition"
          >
            + [Akkord]
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{key: }')}
            className="px-2 py-0.5 rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 border border-navy-600 font-mono cursor-pointer transition"
          >
            + Tonart
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{capo: }')}
            className="px-2 py-0.5 rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 border border-navy-600 font-mono cursor-pointer transition"
          >
            + Capo
          </button>
          <button
            type="button"
            onClick={() => onInsertDirective('{tempo: }')}
            className="px-2 py-0.5 rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 border border-navy-600 font-mono cursor-pointer transition"
          >
            + Tempo
          </button>
        </div>
      )}
    </div>
  );
};
