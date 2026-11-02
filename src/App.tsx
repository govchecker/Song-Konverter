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
  ChevronDown,
  Pencil,
  Eye
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
import { wrapSection, getDirective, setDirective } from './utils/chordproDirectives';
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

  // App mode: Konverter (default) or Bearbeiten of existing ChordPro files.
  // Both modes share outputText, so unsaved conversions show up in the editor.
  const [appMode, setAppMode] = useState<'convert' | 'edit'>('convert');
  const [showEditPreview, setShowEditPreview] = useState<boolean>(true);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSubtitle, setEditSubtitle] = useState<string>('');
  const [editArtist, setEditArtist] = useState<string>('');
  const [openedName, setOpenedName] = useState<string>('');
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

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
  // Startbereich links: sichtbar, solange kein Text da ist und nicht "Leer beginnen" gewählt wurde
  const [startEmpty, setStartEmpty] = useState<boolean>(false);
  const [isStartSamplesOpen, setIsStartSamplesOpen] = useState<boolean>(false);
  // Startbereich im Bearbeiten-Modus
  const [editStartEmpty, setEditStartEmpty] = useState<boolean>(false);
  const [isEditDragOver, setIsEditDragOver] = useState<boolean>(false);
  const showEditStartPanel = appMode === 'edit' && !outputText && !editStartEmpty;
  const showStartPanel = appMode === 'convert' && !inputText && !startEmpty;

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

  // Keep the Titel/Untertitel fields in sync with the {title}/{subtitle} directives in the text.
  // Compare trimmed so trailing spaces typed in the field are not lost.
  useEffect(() => {
    const t = getDirective(outputText, 'title');
    const st = getDirective(outputText, 'subtitle');
    const ar = getDirective(outputText, 'artist');
    setEditArtist(prev => (prev.trim() === ar ? prev : ar));
    setEditTitle(prev => (prev.trim() === t ? prev : t));
    setEditSubtitle(prev => (prev.trim() === st ? prev : st));
  }, [outputText]);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

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

  // Strg+V im Startbereich: Text aus der Zwischenablage direkt übernehmen
  useEffect(() => {
    if (!showStartPanel) return;
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (!text) return;
      e.preventDefault();
      setInputText(text);
      const { metadata } = parseMetadata(text, options.titleArtistOrder);
      if (metadata.title) setTitle(metadata.title);
      if (metadata.artist) setArtist(metadata.artist);
      if (metadata.key) setKey(metadata.key);
      if (metadata.capo) setCapo(metadata.capo);
      if (metadata.tempo) setTempo(metadata.tempo);
      if (autoConvert) handleConvert(text);
      showToast('Text aus der Zwischenablage eingefügt!');
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [showStartPanel, options, autoConvert, title, artist, key, capo, tempo]);

  // Strg+V im Startbereich des Bearbeiten-Modus
  useEffect(() => {
    if (!showEditStartPanel) return;
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text');
      if (!text) return;
      e.preventDefault();
      setOutputText(text);
      showToast('Text aus der Zwischenablage eingefügt!');
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [showEditStartPanel]);

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
    if (appMode === 'edit') {
      filename = openedName || editTitle || 'Song';
    } else if (artist && title) {
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

  // Replace the text of the right textarea and put the selection back afterwards.
  // Restoring scrollTop keeps the view where the user was working instead of jumping.
  const applyToOutput = (updated: string, selStart: number, selEnd: number = selStart) => {
    const scroll = rightTextareaRef.current?.scrollTop ?? 0;
    setOutputText(updated);
    requestAnimationFrame(() => {
      const textarea = rightTextareaRef.current;
      if (!textarea) return;
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(selStart, selEnd);
      textarea.scrollTop = scroll;
    });
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

    // Caret goes into the new tag: onto the empty middle line of a block, else before the closing bracket.
    let caret = textToInsert.length;
    if (textToInsert.includes('\n\n')) caret = textToInsert.indexOf('\n') + 1;
    else if (/[}\]]$/.test(textToInsert)) caret = textToInsert.length - 1;
    applyToOutput(updated, start + caret);
  };

  // Wrap the selection in a section tag (replacing an existing one), or insert an empty block.
  const handleInsertSection = (kind: string, label?: string) => {
    const textarea = rightTextareaRef.current;
    if (textarea) {
      const edit = wrapSection(textarea.value, textarea.selectionStart, textarea.selectionEnd, kind, label);
      if (edit) {
        applyToOutput(edit.text, edit.selStart, edit.selEnd);
        return;
      }
    }
    const open = `{start_of_${kind}${label ? `: ${label}` : ''}}`;
    handleInsertDirective(`${open}\n\n{end_of_${kind}}`);
  };

  // Read a ChordPro file into the editor (file dialog and drag & drop)
  const readChordProFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') return;
      setOutputText(content);
      const dot = file.name.lastIndexOf('.');
      const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : '';
      setOpenedName(dot > 0 ? file.name.slice(0, dot) : file.name);
      if (['chordpro', 'cho', 'pro', 'txt'].includes(ext)) setDownloadExt(ext);
      showToast(`Datei "${file.name}" geöffnet!`);
    };
    reader.readAsText(file);
  };

  // Open an existing ChordPro file in edit mode
  const handleOpenForEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readChordProFile(file);
    e.target.value = '';
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsEditDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readChordProFile(file);
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
    <div className="min-h-screen bg-navy-850 text-navy-100 flex flex-col font-sans selection:bg-accent selection:text-white">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.crd,.tab,.cho,.chordpro,.pro"
        onChange={handleFileUpload}
        className="hidden"
      />

      <input
        ref={editFileInputRef}
        type="file"
        accept=".cho,.chordpro,.chopro,.crd,.pro,.txt"
        onChange={handleOpenForEdit}
        className="hidden"
      />

      {/* Top Navbar */}
      <header className="bg-navy-950 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-md shadow-navy-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/35">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-xl text-white tracking-tight leading-tight">
              Song Konverter
            </h1>
            <p className="text-xs text-chord font-medium">
              Ultimate Guitar zu ChordPro (MobileSheets)
            </p>
          </div>
        </div>

        {/* Mode switch: Konverter / Bearbeiten */}
        <div className="flex items-center bg-navy-900 p-1 rounded-lg border border-navy-650">
          {([
            ['convert', 'Konverter', ArrowRightLeft],
            ['edit', 'Bearbeiten', Pencil],
          ] as const).map(([m, label, Icon]) => (
            <button
              key={m}
              type="button"
              onClick={() => setAppMode(m)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                appMode === m
                  ? 'bg-accent text-white font-bold shadow-sm shadow-accent/35'
                  : 'text-navy-300 hover:text-navy-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2">
          {/* Sample Songs Dropdown */}
          {appMode === 'convert' && (
          <div className="relative" ref={sampleMenuRef}>
            <button
              type="button"
              onClick={() => setIsSampleMenuOpen(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer select-none ${
                isSampleMenuOpen
                  ? 'bg-blue-400/18 text-accent-soft border-accent/60'
                  : 'bg-navy-700 hover:bg-navy-650 text-navy-200 border-navy-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-soft" />
              <span>Beispiel laden</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-navy-300 transition-transform duration-200 ${
                  isSampleMenuOpen ? 'rotate-180 text-accent-soft' : ''
                }`}
              />
            </button>

            {isSampleMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-navy-800 border border-navy-650 rounded-xl shadow-2xl shadow-navy-950/60 py-1.5 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-navy-300 border-b border-navy-650 tracking-wider">
                  Song- & Tab-Vorlagen
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-navy-650/60">
                  {SAMPLE_SONGS.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        handleLoadSample(s.id);
                        setIsSampleMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-navy-700 text-navy-200 flex flex-col gap-0.5 transition cursor-pointer group"
                    >
                      <span className="font-semibold text-chord group-hover:text-accent-soft">
                        {s.artist} – {s.title}
                      </span>
                      <span className="text-[11px] text-navy-300 leading-tight">
                        {s.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Guide Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 text-xs font-medium border border-navy-600 transition cursor-pointer"
            title="Import-Anleitung für MobileSheets auf Android"
          >
            <Tablet className="w-3.5 h-3.5 text-accent-soft" />
            <span className="hidden sm:inline">Tablet Anleitung</span>
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 border border-navy-600 transition cursor-pointer"
            title="Konvertierungs-Optionen anpassen"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Metadata Quick Bar (Title, Artist, Key, Capo, etc.) */}
      {appMode === 'edit' && (
        <div className="bg-navy-900 border-b border-navy-950 px-4 md:px-6 py-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-navy-300 uppercase tracking-wider mr-1">
              Song
            </span>
            {([
              ['Titel', 'title', editTitle, setEditTitle, 'z. B. Drive'],
              ['Untertitel', 'subtitle', editSubtitle, setEditSubtitle, 'z. B. Single-Version'],
              ['Interpret', 'artist', editArtist, setEditArtist, 'z. B. Incubus'],
            ] as const).map(([label, name, value, setValue, placeholder]) => (
              <div
                key={name}
                className="flex items-center bg-navy-850 rounded-md border border-navy-650 px-2.5 py-1 transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-accent/15"
              >
                <span className="text-navy-300 text-[11px] mr-1.5">{label}</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setOutputText(setDirective(outputText, name, e.target.value.trim()));
                  }}
                  placeholder={placeholder}
                  className="bg-transparent text-navy-100 text-xs focus:outline-none w-40 md:w-56 font-medium placeholder-navy-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {appMode === 'convert' && (
      <div className="bg-navy-900 border-b border-navy-950 px-4 md:px-6 py-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-navy-300 uppercase tracking-wider mr-1">
            Metadaten
          </span>

          {/* Artist */}
          <div className="flex items-center bg-navy-850 rounded-md border border-navy-650 px-2.5 py-1 transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-accent/15">
            <span className="text-navy-300 text-[11px] mr-1.5">Interpret</span>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="z. B. Incubus"
              className="bg-transparent text-navy-100 text-xs focus:outline-none w-28 md:w-36 font-medium placeholder-navy-500"
            />
          </div>

          {/* Swap Artist / Title Button */}
          <button
            type="button"
            onClick={handleSwapTitleArtist}
            className="p-1 text-navy-300 hover:text-accent-soft hover:bg-blue-400/18 rounded-md transition cursor-pointer"
            title="Titel und Interpret vertauschen"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>

          {/* Title */}
          <div className="flex items-center bg-navy-850 rounded-md border border-navy-650 px-2.5 py-1 transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-accent/15">
            <span className="text-navy-300 text-[11px] mr-1.5">Titel</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Drive"
              className="bg-transparent text-navy-100 text-xs focus:outline-none w-28 md:w-36 font-medium placeholder-navy-500"
            />
          </div>

          {/* Key */}
          <div className="flex items-center bg-navy-850 rounded-md border border-navy-650 px-2.5 py-1 transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-accent/15">
            <span className="text-navy-300 text-[11px] mr-1.5">Key</span>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Em"
              className="bg-transparent text-accent-soft text-xs focus:outline-none w-14 font-mono placeholder-navy-500"
            />
          </div>

          {/* Capo */}
          <div className="flex items-center bg-navy-850 rounded-md border border-navy-650 px-2.5 py-1 transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-accent/15">
            <span className="text-navy-300 text-[11px] mr-1.5">Capo</span>
            <input
              type="text"
              value={capo}
              onChange={(e) => setCapo(e.target.value)}
              placeholder="z. B. 2"
              className="bg-transparent text-cat-verse text-xs focus:outline-none w-16 font-mono placeholder-navy-500"
            />
          </div>

          {/* N.C. and Live-preview toggles */}
          <div className="ml-auto flex items-center gap-4">
            <label
              className="flex items-center gap-1.5 cursor-pointer text-[11px] text-navy-300 hover:text-navy-100"
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
                className="accent-accent cursor-pointer"
              />
              <span className="font-mono text-accent-soft font-bold">N.C.</span>
              <span>anzeigen</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-navy-300 hover:text-navy-100">
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
                className="accent-accent cursor-pointer"
              />
              <span>Live-Vorschau</span>
            </label>
          </div>
        </div>
      </div>
      )}

      {/* Edit mode: ChordPro editor + optional preview */}
      {appMode === 'edit' && (
        <main className={`flex-1 grid grid-cols-1 gap-4 p-4 md:p-6 min-h-[500px] ${showEditPreview ? 'lg:grid-cols-2' : ''}`}>
          <section className="flex flex-col rounded-xl bg-navy-800 border border-navy-650 overflow-hidden shadow-[0_6px_24px_rgba(5,12,30,0.30)]">
            <ChordProToolbar
              mode="edit"
              viewMode="code"
              onViewModeChange={setViewMode}
              onInsertDirective={handleInsertDirective}
              onInsertSection={handleInsertSection}
              onOpen={() => editFileInputRef.current?.click()}
              showPreview={showEditPreview}
              onTogglePreview={() => setShowEditPreview(prev => !prev)}
              onTranspose={handleTranspose}
              onCopy={handleCopyOutput}
              isCopied={isCopied}
              onDownload={handleDownload}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              downloadExt={downloadExt}
              setDownloadExt={setDownloadExt}
            />
            <div
              className="relative flex-1 flex flex-col bg-navy-825 overflow-hidden min-h-[350px]"
              onDragOver={(e) => {
                e.preventDefault();
                setIsEditDragOver(true);
              }}
              onDragLeave={() => setIsEditDragOver(false)}
              onDrop={handleEditDrop}
            >
              {showEditStartPanel ? (
                <div className="flex-1 flex p-4">
                  <div className={`flex-1 flex flex-col items-center justify-center gap-4 text-center p-6 rounded-xl border-2 border-dashed transition ${
                    isEditDragOver ? 'border-blue-400 bg-navy-800' : 'border-navy-650'
                  }`}>
                    <FileText className="w-10 h-10 text-navy-500" />
                    <div>
                      <p className="text-sm font-bold text-navy-100">ChordPro-Datei hierher ziehen</p>
                      <p className="text-xs text-navy-300 mt-1">.cho, .chordpro, .chopro, .crd, .pro oder .txt aus dem Dateimanager ablegen</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-lg shadow-accent/35 transition cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Datei öffnen…</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStartEmpty(true)}
                        className="px-3 py-1.5 rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 text-xs font-semibold border border-navy-600 transition cursor-pointer"
                      >
                        Leer beginnen
                      </button>
                    </div>
                    <p className="text-xs text-navy-500">oder Text aus der Zwischenablage mit Strg+V einfügen</p>
                  </div>
                </div>
              ) : (
                <textarea
                  ref={rightTextareaRef}
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  autoFocus={editStartEmpty}
                  placeholder="Füge hier ChordPro-Text ein oder öffne eine ChordPro-Datei."
                  className={`flex-1 w-full p-4 bg-navy-825 text-code font-mono text-xs md:text-sm leading-relaxed resize-none focus:outline-none placeholder-navy-500 select-text ${isEditDragOver ? 'ring-2 ring-inset ring-accent' : ''}`}
                  spellCheck={false}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-navy-750 border-t border-navy-650 text-xs text-navy-300">
              <span className="text-[11px] font-mono">
                {outputText ? `${outputText.split('\n').length} Zeilen` : '0 Zeilen'}
                {openedName ? ` • ${openedName}` : ''}
              </span>
              <span className="text-[11px]">Text markieren und auf + Verse, + Chorus … klicken, um ihn einzufassen</span>
            </div>
          </section>

          {showEditPreview && (
            <section className="flex flex-col rounded-xl bg-navy-800 border border-navy-650 overflow-hidden shadow-[0_6px_24px_rgba(5,12,30,0.30)]">
              <div className="flex items-center justify-between gap-2 p-3 bg-navy-950">
                <h2 className="text-xs md:text-sm font-bold text-navy-100 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-accent-soft" />
                  MobileSheets Vorschau
                </h2>
                <div className="flex items-center gap-1 bg-navy-825 px-2 py-1 rounded-lg border border-navy-650 text-xs">
                  <span className="text-navy-300 text-[11px]">Schrift</span>
                  <button
                    type="button"
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    className="px-2 py-0.5 bg-blue-400/18 hover:bg-blue-400/30 rounded-md text-accent-soft transition cursor-pointer"
                    title="Schrift kleiner"
                  >
                    A-
                  </button>
                  <span className="text-navy-300 text-[10px] w-6 text-center">{fontSize}</span>
                  <button
                    type="button"
                    onClick={() => setFontSize(Math.min(26, fontSize + 2))}
                    className="px-2 py-0.5 bg-blue-400/18 hover:bg-blue-400/30 rounded-md text-accent-soft transition cursor-pointer"
                    title="Schrift größer"
                  >
                    A+
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-navy-825">
                {outputText.trim() ? (
                  <MobileSheetsPreview chordProText={outputText} fontSize={fontSize} />
                ) : (
                  <p className="text-sm text-navy-300 text-center mt-8">Keine ChordPro-Daten zur Vorschau</p>
                )}
              </div>
            </section>
          )}
        </main>
      )}

      {/* Main Dual-Pane Workspace */}
      {appMode === 'convert' && (
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 md:p-6 min-h-[500px]">
        {/* ================= LEFT WINDOW: ULTIMATE GUITAR INPUT ================= */}
        <section className="flex flex-col rounded-xl bg-navy-800 border border-navy-650 overflow-hidden shadow-[0_6px_24px_rgba(5,12,30,0.30)]">
          {/* Left Pane Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-navy-950">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-400/18 text-accent-soft text-xs font-bold font-mono">
                1
              </span>
              <h2 className="text-xs md:text-sm font-bold text-navy-100">
                Ultimate Guitar Text (Eingabe)
              </h2>
            </div>

            {/* Actions for Left Editor */}
            <div className="flex items-center gap-1.5">
              {/* Load File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 border border-navy-600 transition cursor-pointer"
                title="Textdatei (.txt, .crd) laden"
              >
                <FolderOpen className="w-3.5 h-3.5 text-accent-soft" />
                <span className="hidden sm:inline">Datei laden</span>
              </button>

              {/* Paste from Clipboard */}
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 border border-navy-600 transition cursor-pointer"
                title="Aus der Zwischenablage einfügen"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-accent-soft" />
                <span>Einfügen</span>
              </button>

              {/* Clear */}
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setStartEmpty(false);
                  showToast('Eingabe geleert.');
                }}
                className="p-1 rounded-md text-navy-300 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                title="Textfeld leeren"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Textarea for input with Drag & Drop */}
          <div
            className={`relative flex-1 flex flex-col transition ${
              isDragOver ? 'ring-2 ring-accent bg-accent/5' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {showStartPanel ? (
              <div className="flex-1 flex p-4 bg-navy-825">
                <div className={`flex-1 flex flex-col items-center justify-center gap-4 text-center p-6 rounded-xl border-2 border-dashed transition ${
                  isDragOver ? 'border-blue-400 bg-navy-800' : 'border-navy-650'
                }`}>
                  <FileText className="w-10 h-10 text-navy-500" />
                  <div>
                    <p className="text-sm font-bold text-navy-100">Textdatei hierher ziehen</p>
                    <p className="text-xs text-navy-300 mt-1">.txt aus dem Dateimanager ablegen</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-lg shadow-accent/35 transition cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Datei hochladen…</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsStartSamplesOpen(prev => !prev)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 text-xs font-semibold border border-navy-600 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-accent-soft" />
                      <span>Beispiel laden</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-navy-300 transition-transform ${isStartSamplesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setStartEmpty(true)}
                      className="px-3 py-1.5 rounded-md bg-navy-700 hover:bg-navy-650 text-navy-200 text-xs font-semibold border border-navy-600 transition cursor-pointer"
                    >
                      Leer beginnen
                    </button>
                  </div>
                  {isStartSamplesOpen && (
                    <div className="w-full max-w-xs bg-navy-800 border border-navy-650 rounded-lg py-1 text-left">
                      {SAMPLE_SONGS.map(song => (
                        <button
                          key={song.id}
                          type="button"
                          onClick={() => {
                            handleLoadSample(song.id);
                            setIsStartSamplesOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-navy-200 hover:bg-navy-700 transition cursor-pointer"
                        >
                          {song.artist} – {song.title}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-navy-500">oder Text aus der Zwischenablage mit Strg+V einfügen</p>
                </div>
              </div>
            ) : (
              <textarea
                value={inputText}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputText(val);
                  if (autoConvert) {
                    handleConvert(val);
                  }
                }}
                autoFocus={startEmpty}
                placeholder={`Füge hier den Songtext mit Akkorden aus Ultimate Guitar ein...\n\nBeispiel:\n[Verse]\nEm      Em7    Cmaj7      A7\nSometimes, I feel the fear of uncertainty`}
                className="flex-1 w-full p-4 bg-navy-825 text-navy-100 font-mono text-xs md:text-sm leading-relaxed resize-none focus:outline-none placeholder-navy-500 select-text"
                spellCheck={false}
              />
            )}
          </div>

          {/* Left Footer: Stats & Convert Action Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-navy-750 border-t border-navy-650 text-xs">
            <span className="text-navy-300 text-[11px] font-mono">
              {inputText.split('\n').length} Zeilen • {inputText.length} Zeichen
            </span>

            {/* Big Convert Button */}
            <button
              type="button"
              onClick={() => handleConvert()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold shadow-lg shadow-accent/35 transition active:scale-95 cursor-pointer"
              title="Akkorde und Text in ChordPro umwandeln (Strg + Enter)"
            >
              <span>In ChordPro konvertieren</span>
              <ArrowRight className="w-4 h-4 font-bold" />
            </button>
          </div>
        </section>

        {/* ================= RIGHT WINDOW: CHORDPRO OUTPUT & PREVIEW ================= */}
        <section className="flex flex-col rounded-xl bg-navy-800 border border-navy-650 overflow-hidden shadow-[0_6px_24px_rgba(5,12,30,0.30)]">
          {/* Top Toolbar */}
          <ChordProToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onInsertDirective={handleInsertDirective}
            onInsertSection={handleInsertSection}
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
          <div className="relative flex-1 flex flex-col bg-navy-825 overflow-hidden min-h-[350px]">
            {viewMode === 'code' ? (
              <textarea
                ref={rightTextareaRef}
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                placeholder="Das konvertierte ChordPro-Format erscheint hier, sobald du links einen Song lädst oder einfügst."
                className="flex-1 w-full p-4 bg-navy-825 text-code font-mono text-xs md:text-sm leading-relaxed resize-none focus:outline-none placeholder-navy-500 select-text"
                spellCheck={false}
              />
            ) : (
              <div className="flex-1 overflow-auto p-4">
                {outputText.trim() ? (
                  <MobileSheetsPreview chordProText={outputText} fontSize={fontSize} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-navy-300 text-center">
                    <Tablet className="w-12 h-12 mb-3 text-navy-500" />
                    <p className="text-sm font-semibold text-navy-200">Keine ChordPro-Daten zur Vorschau</p>
                    <p className="text-xs text-navy-500 mt-1 max-w-sm">
                      Klicke links auf „In ChordPro konvertieren“, um hier das Layout wie auf dem MobileSheets Tablet zu sehen.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Footer: Status & Quick Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-navy-750 border-t border-navy-650 text-xs text-navy-300">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono">
                {outputText ? `${outputText.split('\n').length} Zeilen` : '0 Zeilen'}
              </span>
              <span className="text-navy-500">•</span>
              <span className="text-[11px]">
                Direkt editierbar & MobileSheets-kompatibel
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-navy-300">Tipp:</span>
              <span className="text-accent-soft font-semibold">Strg + Enter</span>
              <span className="text-navy-300">zum Konvertieren</span>
            </div>
          </div>
        </section>
      </main>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-md bg-navy-800 text-navy-100 border border-navy-650 shadow-2xl shadow-navy-950/60 animate-bounce-short">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
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
