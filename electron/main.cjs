const { app, BrowserWindow, ipcMain, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isDev = process.env.ELECTRON_DEV === '1';

app.setName('Song Konverter');

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let mainWindow = null;

// Fenstergröße und -position werden beim Schließen gespeichert und beim Start wiederhergestellt.
const stateFile = () => path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  try {
    const s = JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
    if (!Number.isFinite(s.width) || !Number.isFinite(s.height)) return null;
    return s;
  } catch {
    return null;
  }
}

// Position nur übernehmen, wenn das Fenster auf einem aktuell vorhandenen Bildschirm liegt.
function isVisibleOnSomeDisplay(s) {
  if (!Number.isFinite(s.x) || !Number.isFinite(s.y)) return false;
  return screen.getAllDisplays().some(({ workArea: a }) =>
    s.x < a.x + a.width && s.x + s.width > a.x && s.y < a.y + a.height && s.y + s.height > a.y);
}

function saveWindowState() {
  if (!mainWindow) return;
  const state = { ...mainWindow.getNormalBounds(), maximized: mainWindow.isMaximized() };
  try {
    fs.writeFileSync(stateFile(), JSON.stringify(state));
  } catch {}
}

function createWindow() {
  const saved = loadWindowState();
  const bounds = saved ? { width: saved.width, height: saved.height } : { width: 1280, height: 800 };
  if (saved && isVisibleOnSomeDisplay(saved)) {
    bounds.x = saved.x;
    bounds.y = saved.y;
  }
  mainWindow = new BrowserWindow({
    ...bounds,
    minWidth: 800,
    minHeight: 600,
    title: 'Song Konverter',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });
  mainWindow.setMenu(null);
  if (saved?.maximized) mainWindow.maximize();

  // Externe Links im Standardbrowser statt in der App öffnen.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('close', saveWindowState);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// PDF-Ansicht: HTML des Songs in einem unsichtbaren Fenster zu A4-PDF drucken und
// das Ergebnis im eingebauten PDF-Betrachter anzeigen (dort gibt es auch „Speichern“).
ipcMain.handle('pdf:show', async (_event, { html, title }) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'song-konverter-'));
  const baseName = String(title || 'Song').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120) || 'Song';
  const htmlFile = path.join(dir, 'song.html');
  const pdfFile = path.join(dir, `${baseName}.pdf`);
  const cleanup = () => fs.rmSync(dir, { recursive: true, force: true });

  const printWin = new BrowserWindow({
    show: false,
    webPreferences: { javascript: false, sandbox: true, contextIsolation: true },
  });
  try {
    fs.writeFileSync(htmlFile, String(html), 'utf8');
    await printWin.loadFile(htmlFile);
    const pdf = await printWin.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
    fs.writeFileSync(pdfFile, pdf);
  } catch (err) {
    cleanup();
    throw err;
  } finally {
    printWin.destroy();
  }

  const viewer = new BrowserWindow({
    width: 900,
    height: 1000,
    title: `${baseName}.pdf`,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    autoHideMenuBar: true,
    parent: mainWindow || undefined,
    webPreferences: { contextIsolation: true, nodeIntegration: false, plugins: true },
  });
  viewer.setMenu(null);
  viewer.on('closed', cleanup);
  await viewer.loadFile(pdfFile);
});

app.on('second-instance', () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => app.quit());
