const { contextBridge, ipcRenderer } = require('electron');  

contextBridge.exposeInMainWorld('electronAPI', {  
  runPowershellDemo: () => ipcRenderer.send('run-powershell-demo')  
});  