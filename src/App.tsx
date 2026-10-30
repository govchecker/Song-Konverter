import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  ClipboardPaste,
  ArrowRightLeft,
  ArrowRight,
  Download,
  Copy,
  Trash2,
  Settings,
  HelpCircle,
  Music,
  Check,
  FileText,
  RotateCcw,
  Sparkles,
  Tablet,
  FolderOpen,
  ChevronDown
} from 'lucide-react';
import {
  convertToChordPro,
  ConverterOptions,
  defaultOptions,
  parseMetadata,
  SongMetadata
} from './utils/chordproConverter';
import { transposeChordPro } from './utils/chordTransposer';
import { SAMPLE_SONGS } from './utils/sampleSongs';
import { ChordProToolbar } from './components/ChordProToolbar';
import { MobileSheetsPreview } from './components/MobileSheetsPreview';
import { MobileSheetsGuideModal } from './components/MobileSheetsGuideModal';
import { ConversionSettingsModal } from './components/ConversionSettingsModal';

export default function App() {
  // Input and Output states
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [autoConvert, setAutoConvert] = useState<boolean>(false);

  // View mode for right pane: 'code' or 'preview'
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [fontSize, setFontSize] = useState<number>(15);
  const [downloadExt, setDownloadExt] = useState<string>('chordpro');

  // Metadata states
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [capo, setCapo] = useState<string>('');
  const [tempo, setTempo] = useState<string>('');

  // Modals & UI states
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<ConverterOptions>(defaultOptions);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // File input ref for uploading .txt files
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rightTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isSampleMenuOpen, setIsSampleMenuOpen] = useState<boolean>(false);
  const sampleMenuRef = useRef<HTMLDivElement | null>(null);

  // Close sample menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sampleMenuRef.current && !sampleMenuRef.current.contains(event.target as Node)) {
        setIsSampleMenuOpen(false);
      }
    };
    if (isSampleMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSampleMenuOpen]);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // On initial load, load the Incubus - Drive sample by default so the user sees it immediately!
  useEffect(() => {
    const driveSample = SAMPLE_SONGS[0];
    setInputText(driveSample.content);
    const converted = convertToChordPro(driveSample.content, options);
    setOutputText(converted);
    const { metadata } = parseMetadata(driveSample.content, options.titleArtistOrder);
    if (metadata.title) setTitle(metadata.title);
    if (metadata.artist) setArtist(metadata.artist);
    if (metadata.key) setKey(metadata.key);
    if (metadata.capo) setCapo(metadata.capo);
    if (metadata.tempo) setTempo(metadata.tempo);
  }, []);

  // Conversion trigger
  const handleConvert = (customSource?: string, customOpts?: ConverterOptions) => {
    const source = customSource !== undefined ? customSource : inputText;
    if (!source.trim()) {
      setOutputText('');
      return;
    }

    const activeOpts = customOpts || options;
    // Include metadata in conversion options if provided
    const conversionOpts: Partial<ConverterOptions> = {
      ...activeOpts,
      customTitle: title || undefined,
      customArtist: artist || undefined,
      customKey: key || undefined,
      customCapo: capo || undefined,
      customTempo: tempo || undefined,
    };

    const converted = convertToChordPro(source, conversionOpts);
    setOutputText(converted);
    showToast('Erfolgreich in ChordPro konvertiert!');
  };

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter converts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConvert();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputText, title, artist, key, capo, tempo, options]);

  // Load a file from disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === 'string') {
        setInputText(content);
        // Also extract metadata
        const { metadata } = parseMetadata(content, options.titleArtistOrder);
        if (metadata.title) setTitle(metadata.title);
        if (metadata.artist) setArtist(metadata.artist);
        if (metadata.key) setKey(metadata.key);
        if (metadata.capo) setCapo(metadata.capo);
        if (metadata.tempo) setTempo(metadata.tempo);

        if (autoConvert) {
          handleConvert(content);
        }
        showToast(`Datei "${file.name}" erfolgreich geladen!`);
      }
    };
    reader.readAsText(file);
    // Reset file input value so user can re-upload same file if desired
    e.target.value = '';
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (typeof content === 'string') {
          setInputText(content);
          const { metadata } = parseMetadata(content, options.titleArtistOrder);
          if (metadata.title) setTitle(metadata.title);
          if (metadata.artist) setArtist(metadata.artist);
          if (autoConvert) handleConvert(content);
          showToast(`Datei "${file.name}" per Drag & Drop eingefügt!`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        showToast('Die Zwischenablage ist leer.');
        return;
      }
      setInputText(text);
      const { metadata } = parseMetadata(text, options.titleArtistOrder);
      if (metadata.title) setTitle(metadata.title);
      if (metadata.artist) setArtist(metadata.artist);
      if (metadata.key) setKey(metadata.key);
      if (metadata.capo) setCapo(metadata.capo);
      if (metadata.tempo) setTempo(metadata.tempo);

      if (autoConvert) {
        handleConvert(text);
      }
      showToast('Text aus der Zwischenablage eingefügt!');
    } catch (err) {
      showToast('Zugriff auf Zwischenablage verweigert. Bitte Strg+V nutzen.');
    }
  };

  // Copy ChordPro output to clipboard
  const handleCopyOutput = async () => {
    if (!outputText) {
      showToast('Kein Inhalt zum Kopieren vorhanden.');
      return;
    }
    try {
      await navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      showToast('ChordPro-Text in die Zwischenablage kopiert!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      showToast('Fehler beim Kopieren.');
    }
  };

  // Save ChordPro file to disk
  const handleDownload = (extension: string) => {
    if (!outputText) {
      showToast('Rechtes Fenster ist leer – kein Inhalt zum Speichern.');
      return;
    }

    // Determine filename from title and artist
    let filename = 'Song';
    if (artist && title) {
      filename = `${artist} - ${title}`;
    } else if (title) {
      filename = title;
    } else if (artist) {
      filename = artist;
    }

    // Clean filename
    filename = filename.replace(/[/\\?%*:|"<>]/g, '_');
    const fullName = `${filename}.${extension}`;

    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fullName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Gespeichert als "${fullName}"!`);
  };

  // Transpose output chords
  const handleTranspose = (semitones: number) => {
    if (!outputText) return;
    const transposed = transposeChordPro(outputText, semitones);
    setOutputText(transposed);
    showToast(`Um ${semitones > 0 ? `+${semitones}` : semitones} Halbton transponiert!`);
  };

  // Insert directive into right textarea
  const handleInsertDirective = (textToInsert: string) => {
    const textarea = rightTextareaRef.current;
    if (!textarea) {
      setOutputText(prev => prev + '\n' + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const updated = current.substring(0, start) + textToInsert + current.substring(end);
    setOutputText(updated);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 10);
  };

  // Load a sample song
  const handleLoadSample = (sampleId: string) => {
    const song = SAMPLE_SONGS.find(s => s.id === sampleId);
    if (!song) return;

    setInputText(song.content);
    setTitle(song.title);
    setArtist(song.artist);

    const converted = convertToChordPro(song.content, {
      ...options,
      customTitle: song.title,
      customArtist: song.artist,
    });
    setOutputText(converted);
    showToast(`Beispiel "${song.artist} - ${song.title}" geladen!`);
  };

  // Swap Title & Artist
  const handleSwapTitleArtist = () => {
    const currentTitle = title;
    setTitle(artist);
    setArtist(currentTitle);
    showToast('Titel und Interpret vertauscht!');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.crd,.tab,.cho,.chordpro,.pro"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Navbar */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-md shadow-amber-900/20 font-bold">
            <Music className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-xl text-stone-100 tracking-tight leading-tight">
              Song Konverter
            </h1>
            <p className="text-xs text-amber-400 font-medium">
              Ultimate Guitar zu ChordPro (MobileSheets)
            </p>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2">
          {/* Sample Songs Dropdown */}
          <div className="relative" ref={sampleMenuRef}>
            <button
              type="button"
              onClick={() => setIsSampleMenuOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer select-none ${
                isSampleMenuOpen
                  ? 'bg-amber-600/20 text-amber-300 border-amber-500/50'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Beispiel laden</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                  isSampleMenuOpen ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {isSampleMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl py-1.5 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-stone-400 border-b border-stone-800 tracking-wider">
                  Song- & Tab-Vorlagen
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-stone-800/60">
                  {SAMPLE_SONGS.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        handleLoadSample(s.id);
                        setIsSampleMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-stone-800 text-stone-200 flex flex-col gap-0.5 transition cursor-pointer group"
                    >
                      <span className="font-semibold text-amber-400 group-hover:text-amber-300">
                        {s.artist} – {s.title}
                      </span>
                      <span className="text-[11px] text-stone-400 leading-tight">
                        {s.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guide Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition cursor-pointer"
            title="Import-Anleitung für MobileSheets auf Android"
          >
            <Tablet className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Tablet Anleitung</span>
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition cursor-pointer"
            title="Konvertierungs-Optionen anpassen"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Metadata Quick Bar (Title, Artist, Key, Capo, etc.) */}
      <div className="bg-stone-900/60 border-b border-stone-800 px-4 md:px-6 py-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
            Metadaten:
          </span>

          {/* Artist */}
          <div className="flex items-center bg-stone-950 rounded-md border border-stone-800 px-2 py-1">
            <span className="text-stone-400 text-[10px] mr-1.5 font-mono">Interpret:</span>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="z. B. Incubus"
              className="bg-transparent text-stone-200 text-xs focus:outline-none w-28 md:w-36 font-medium placeholder-stone-600"
            />
          </div>

          {/* Swap Artist / Title Button */}
          <button
            type="button"
            onClick={handleSwapTitleArtist}
            className="p-1 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded transition cursor-pointer"
            title="Titel und Interpret vertauschen"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          {/* Title */}
          <div className="flex items-center bg-stone-950 rounded-md border border-stone-800 px-2 py-1">
            <span className="text-stone-400 text-[10px] mr-1.5 font-mono">Titel:</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Drive"
              className="bg-transparent text-stone-200 text-xs focus:outline-none w-28 md:w-36 font-medium placeholder-stone-600"
            />
          </div>

          {/* Key */}
          <div className="flex items-center bg-stone-950 rounded-md border border-stone-800 px-2 py-1">
            <span className="text-stone-400 text-[10px] mr-1 font-mono">Key:</span>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Em"
              className="bg-transparent text-amber-400 text-xs focus:outline-none w-14 font-mono placeholder-stone-600"
            />
          </div>

          {/* Capo */}
          <div className="flex items-center bg-stone-950 rounded-md border border-stone-800 px-2 py-1">
            <span className="text-stone-400 text-[10px] mr-1 font-mono">Capo:</span>
            <input
              type="text"
              value={capo}
              onChange={(e) => setCapo(e.target.value)}
              placeholder="z. B. 2"
              className="bg-transparent text-sky-400 text-xs focus:outline-none w-16 font-mono placeholder-stone-600"
            />
          </div>

          {/* N.C. and Live-preview toggles */}
          <div className="ml-auto flex items-center gap-3">
            <label
              className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-300 hover:text-stone-100"
              title="N.C. (No Chord) im ChordPro-Dokument anzeigen oder ausblenden (standardmäßig aktiv)"
            >
              <input
                type="checkbox"
                checked={!options.ignoreNC}
                onChange={(e) => {
                  const newOpts: ConverterOptions = { ...options, ignoreNC: !e.target.checked };
                  setOptions(newOpts);
                  handleConvert(undefined, newOpts);
                  showToast(e.target.checked ? 'N.C. eingeblendet' : 'N.C. ausgeblendet');
                }}
                className="rounded border-stone-700 text-amber-600 focus:ring-amber-500 bg-stone-950"
              />
              <span className="font-mono text-amber-400 font-bold">N.C.</span>
              <span>anzeigen</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-400 hover:text-stone-300">
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
                className="rounded border-stone-700 text-amber-600 focus:ring-amber-500 bg-stone-950"
              />
              <span>Live-Vorschau</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 md:p-6 min-h-[500px]">
        {/* ================= LEFT WINDOW: ULTIMATE GUITAR INPUT ================= */}
        <section className="flex flex-col rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-lg">
          {/* Left Pane Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-900 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold font-mono">
                1
              </span>
              <h2 className="text-xs md:text-sm font-bold text-stone-200">
                Ultimate Guitar Text (Eingabe)
              </h2>
            </div>

            {/* Actions for Left Editor */}
            <div className="flex items-center gap-1.5">
              {/* Load File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition cursor-pointer"
                title="Textdatei (.txt, .crd) laden"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Datei laden</span>
              </button>

              {/* Paste from Clipboard */}
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition cursor-pointer"
                title="Aus der Zwischenablage einfügen"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
                <span>Einfügen</span>
              </button>

              {/* Clear */}
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  showToast('Eingabe geleert.');
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition cursor-pointer"
                title="Textfeld leeren"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Textarea for input with Drag & Drop */}
          <div
            className={`relative flex-1 flex flex-col transition ${
              isDragOver ? 'ring-2 ring-amber-500 bg-amber-500/5' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <textarea
              value={inputText}
              onChange={(e) => {
                const val = e.target.value;
                setInputText(val);
                if (autoConvert) {
                  handleConvert(val);
                }
              }}
              placeholder={`Füge hier den Songtext mit Akkorden aus Ultimate Guitar ein...\n\nBeispiel:\n[Verse]\nEm      Em7    Cmaj7      A7\nSometimes, I feel the fear of uncertainty`}
              className="flex-1 w-full p-4 bg-stone-950 text-stone-200 font-mono text-xs md:text-sm leading-relaxed resize-none focus:outline-none placeholder-stone-600 select-text"
              spellCheck={false}
            />

            {/* Drag & drop overlay hint if empty */}
            {!inputText && !isDragOver && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 text-stone-500 text-center">
                <FileText className="w-10 h-10 mb-2 text-stone-600" />
                <p className="text-sm font-medium">Text hier einfügen oder .txt Datei hineinziehen</p>
                <p className="text-xs text-stone-600 mt-1">
                  Unterstützt Ultimate Guitar Akkordzeilen über Text
                </p>
              </div>
            )}
          </div>

          {/* Left Footer: Stats & Convert Action Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-900 border-t border-stone-800 text-xs">
            <span className="text-stone-400 text-[11px] font-mono">
              {inputText.split('\n').length} Zeilen • {inputText.length} Zeichen
            </span>

            {/* Big Convert Button */}
            <button
              type="button"
              onClick={() => handleConvert()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-950/40 transition active:scale-95 cursor-pointer"
              title="Akkorde und Text in ChordPro umwandeln (Strg + Enter)"
            >
              <span>In ChordPro konvertieren</span>
              <ArrowRight className="w-4 h-4 font-bold" />
            </button>
          </div>
        </section>

        {/* ================= RIGHT WINDOW: CHORDPRO OUTPUT & PREVIEW ================= */}
        <section className="flex flex-col rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-lg">
          {/* Top Toolbar */}
          <ChordProToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onInsertDirective={handleInsertDirective}
            onTranspose={handleTranspose}
            onCopy={handleCopyOutput}
            isCopied={isCopied}
            onDownload={handleDownload}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            downloadExt={downloadExt}
            setDownloadExt={setDownloadExt}
          />

          {/* Right Main Body: Either Raw Code Editor or MobileSheets Sheet View */}
          <div className="relative flex-1 flex flex-col bg-stone-950 overflow-hidden min-h-[350px]">
            {viewMode === 'code' ? (
              <textarea
                ref={rightTextareaRef}
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                placeholder={`Das konvertierte ChordPro-Format erscheint hier...\n\nBeispiel:\n{title: Drive}\n{artist: Incubus}\n\n{start_of_verse: Verse}\n[Em]Sometime[Em7]s, I fe[Cmaj7]el the fear[A7]...\n{end_of_verse}`}
                className="flex-1 w-full p-4 bg-stone-950 text-amber-200/90 font-mono text-xs md:text-sm leading-relaxed resize-none focus:outline-none placeholder-stone-600 select-text"
                spellCheck={false}
              />
            ) : (
              <div className="flex-1 overflow-auto">
                {outputText.trim() ? (
                  <MobileSheetsPreview chordProText={outputText} fontSize={fontSize} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-stone-500 text-center">
                    <Tablet className="w-12 h-12 mb-3 text-stone-600" />
                    <p className="text-sm font-semibold text-stone-400">Keine ChordPro-Daten zur Vorschau</p>
                    <p className="text-xs text-stone-600 mt-1 max-w-sm">
                      Klicke links auf „In ChordPro konvertieren“, um hier das Layout wie auf dem MobileSheets Tablet zu sehen.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Footer: Status & Quick Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-900 border-t border-stone-800 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono">
                {outputText ? `${outputText.split('\n').length} Zeilen` : '0 Zeilen'}
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-[11px]">
                Direkt editierbar & MobileSheets-kompatibel
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-stone-400">Tipp:</span>
              <span className="text-amber-400">Strg + Enter</span>
              <span className="text-stone-500">zum Konvertieren</span>
            </div>
          </div>
        </section>
      </main>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 text-stone-100 border border-stone-700 shadow-2xl animate-bounce-short">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <MobileSheetsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <ConversionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          // Re-convert with new settings
          handleConvert();
        }}
        options={options}
        onChangeOptions={setOptions}
      />
    </div>
  );
}
