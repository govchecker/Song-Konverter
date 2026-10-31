import React from 'react';
import { X, Tablet, FileText, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface MobileSheetsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSheetsGuideModal: React.FC<MobileSheetsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-navy-800 border border-navy-650 rounded-xl shadow-2xl shadow-navy-950/60 p-6 text-navy-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between -mx-6 -mt-6 px-6 py-4 mb-5 bg-navy-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-blue-400/18 border border-accent/30 flex items-center justify-center text-accent-soft">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">MobileSheets Import-Anleitung</h2>
              <p className="text-xs text-navy-300">So bringst du deine Songs auf dein Android-Tablet</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-navy-300 hover:text-white hover:bg-navy-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-navy-825 border border-navy-650">
            <div className="w-6 h-6 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-semibold text-navy-100">Song umwandeln & als Datei speichern</h3>
              <p className="text-xs text-navy-300 mt-0.5">
                Klicke rechts oben auf <strong>„Speichern“</strong>. Die Datei wird standardmäßig mit der Endung{' '}
                <code className="text-chord font-mono">.chordpro</code> (oder <code className="text-chord font-mono">.cho</code>) heruntergeladen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-navy-825 border border-navy-650">
            <div className="w-6 h-6 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="font-semibold text-navy-100">Datei auf dein Android-Tablet übertragen</h3>
              <p className="text-xs text-navy-300 mt-0.5">
                Übertrage die Datei einfach über <strong>Google Drive</strong>, Dropbox, per <strong>USB-Kabel</strong>, Dateimanager oder per E-Mail an dein Tablet.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-navy-825 border border-navy-650">
            <div className="w-6 h-6 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-semibold text-navy-100">In MobileSheets importieren</h3>
              <p className="text-xs text-navy-300 mt-0.5">
                Öffne die <strong>MobileSheets</strong> App auf deinem Android-Tablet. Tippe oben auf <strong>Importieren</strong> → <strong>Datei</strong> und wähle deine <code className="text-chord font-mono">.chordpro</code> Datei aus.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/30 text-navy-100">
            <CheckCircle2 className="w-5 h-5 text-accent-soft shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-chord">Perfekt formatiert:</strong> MobileSheets erkennt automatisch Titel, Interpret, Tonart, Capo und alle Akkorde. Du kannst in MobileSheets nach Belieben transponieren, Schriftgrößen ändern und Auto-Scroll nutzen!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-md shadow-sm shadow-accent/35 text-xs transition cursor-pointer"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
};
