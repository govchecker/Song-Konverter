import React from 'react';
import { X, Tablet, FileText, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface MobileSheetsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSheetsGuideModal: React.FC<MobileSheetsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 text-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100">MobileSheets Import-Anleitung</h2>
              <p className="text-xs text-stone-400">So bringst du deine Songs auf dein Android-Tablet</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-semibold text-stone-200">Song umwandeln & als Datei speichern</h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Klicke rechts oben auf <strong>„Speichern“</strong>. Die Datei wird standardmäßig mit der Endung{' '}
                <code className="text-amber-400 font-mono">.chordpro</code> (oder <code className="text-amber-400 font-mono">.cho</code>) heruntergeladen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="font-semibold text-stone-200">Datei auf dein Android-Tablet übertragen</h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Übertrage die Datei einfach über <strong>Google Drive</strong>, Dropbox, per <strong>USB-Kabel</strong>, Dateimanager oder per E-Mail an dein Tablet.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-semibold text-stone-200">In MobileSheets importieren</h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Öffne die <strong>MobileSheets</strong> App auf deinem Android-Tablet. Tippe oben auf <strong>Importieren</strong> → <strong>Datei</strong> und wähle deine <code className="text-amber-400 font-mono">.chordpro</code> Datei aus.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-amber-300">Perfekt formatiert:</strong> MobileSheets erkennt automatisch Titel, Interpret, Tonart, Capo und alle Akkorde. Du kannst in MobileSheets nach Belieben transponieren, Schriftgrößen ändern und Auto-Scroll nutzen!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
};
