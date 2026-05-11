# Busted Demo – Fileless Malware Execution Simulation (Educational Project)

## Demo

[Watch demo video](https://hogeschoolpxl-my.sharepoint.com/:v:/g/personal/12402765_student_pxl_be/IQCYzUZ08H7-Qa0Tkrg5It1PAcH1aKez5w55QC5CSuBfmWE?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=wn8V6A)

## Team memmbers

Bjorn Mijs & Timur Khakimov

## Project Overview

Busted Demo is an educational security project that simulates a fileless malware execution chain in a controlled environment.

The project demonstrates how a simple browser interaction can indirectly trigger local code execution without dropping a traditional malware file on disk. This type of technique is commonly referred to as a *fileless malware technique*.

Execution chain (simplified):

Browser → Custom Protocol → Electron Application → PowerShell (In-Memory Execution)

The purpose of this project is to understand how fileless malware techniques work, how they are triggered, and how they can be detected in system logs. This implementation is strictly educational and runs only in an isolated virtual machine.

---

## What is Fileless Malware?

Fileless malware refers to attack techniques where:

- No malicious executable is written to disk.
- Legitimate system tools (e.g., PowerShell) are used.
- Code executes directly in memory.
- Traditional antivirus detection can be more difficult.

Instead of dropping a `.exe` payload, attackers often rely on:

- PowerShell
- WMI
- Registry modifications
- Script-based execution
- Living-off-the-land binaries (LOLBins)

This project simulates such a technique in a safe and controlled way.

---

## Concept of This Demonstration

Modern operating systems allow applications to register custom protocol handlers (e.g., `teams://`, `zoommtg://`, etc.).

This project uses a custom protocol:

```
m1jsdemo://run
```

When triggered from a WordPress page:

1. Windows launches a locally installed Electron application.
2. The Electron application verifies the request.
3. PowerShell is spawned using an encoded command.
4. A demonstration script executes in memory.

No malicious payload is executed. The script only displays an educational window explaining what happened.

---

## Execution Flow

### 1. Website Interaction

A WordPress page contains a button linking to:

```
m1jsdemo://run
```

When the user clicks the button, the browser attempts to open the registered protocol handler.

---

### 2. Windows Protocol Handler

Windows detects that `m1jsdemo://` is registered and launches the associated Electron application.

This mirrors how many legitimate applications integrate with the operating system.

---

### 3. Electron Application

The Electron application:

- Receives the deep link argument.
- Validates it against a strict allowlist.
- Prevents arbitrary command injection.
- Spawns PowerShell using `-EncodedCommand`.

This step simulates how an attacker might leverage a legitimate application to trigger a fileless execution chain.

---

### 4. PowerShell In-Memory Execution

PowerShell:

- Executes a script directly in memory.
- Displays a terminal-style WinForms window.
- Shows ASCII art (M1jsXploit).
- Explains that a fileless technique was demonstrated.

No persistence mechanisms are implemented.
No system changes are made.
No destructive actions occur.

---

## Educational Objectives

This project is designed to help understand:

- How fileless malware techniques are triggered.
- How browser-to-system execution works.
- How protocol handlers can be abused.
- How PowerShell can execute commands in memory.
- How such activity appears in Windows logs.

It can be used to:

- Demonstrate attack chains in a lab environment.
- Analyze Event ID 4688 (Process Creation).
- Study parent-child process relationships.
- Practice defensive detection strategies.

---

## Security & Ethical Notice

⚠️ Education Only

This project simulates a fileless malware technique for awareness and defensive study.

It does NOT:

- Deliver real malware.
- Create persistence.
- Modify system security.
- Exfiltrate data.
- Bypass protections.

It must only be used in a controlled VM environment.

The goal is understanding and detection, not exploitation.

---

## Recommended Testing Environment

For proper analysis, run this project in:

- A Windows 10/11 virtual machine
- With PowerShell logging enabled
- With process auditing enabled
- Optionally with a monitoring tool (e.g., SIEM) to observe logs

This allows clear visibility of how fileless execution chains behave from a defensive perspective.

---

## License

This project is licensed under the MIT License.
