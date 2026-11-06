const { contextBridge, ipcRenderer } = require('electron');

// Einzige Brücke zwischen Oberfläche und Hauptprozess: PDF-Ansicht eines Songs.
contextBridge.exposeInMainWorld('songKonverter', {
  showPdf: (data) => ipcRenderer.invoke('pdf:show', data),
});
