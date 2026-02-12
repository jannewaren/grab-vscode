# Changelog

## 0.4.0

### Added

- **Grab: Remote URL with Line** — copy a GitHub/GitLab permalink with line number anchor (`#L42` or `#L10-L20`)

### Changed

- **Grab: Remote URL** now copies the file permalink without line anchor (previously included line numbers)

## 0.3.0

### Changed

- Reduced default keybindings from 10 to 2 (`Cmd+Shift+Alt+C` for Path with Line, `Cmd+Shift+Alt+X` for Code with Context)

### Added

- Getting Started walkthrough (Command Palette → "Get Started with Grab")
- Suggested shortcut documentation for all unbound commands

## 0.2.0

### Added

- **Grab: Diagnostics (File)** — copy all errors/warnings from the current file in `file:line: severity: message [source]` format
- **Grab: Diagnostics (All)** — copy all errors/warnings from the entire workspace
- Keybinding `Cmd+Shift+Alt+D` for file diagnostics
- Keybinding `Cmd+Shift+Alt+E` for all diagnostics

## 0.1.0

Initial release.

### Commands

- **Grab: Path with Line** — copy relative path with line number (`src/file.ts:42`)
- **Grab: Full Path with Line** — copy absolute path with line number
- **Grab: Relative Path** — copy relative path without line number
- **Grab: Full Path** — copy absolute path without line number
- **Grab: All Open Paths** — copy all open file tabs as newline-separated paths
- **Grab: Code with Context** — copy selected code as a fenced markdown block with path header
- **Grab: Symbol Context** — copy the full definition of the symbol at cursor with path header
- **Grab: Remote URL** — copy a GitHub/GitLab permalink for the current file and line(s)

### Settings

- `grab.defaultPathStyle` — choose relative or absolute as default
- `grab.openPathsSeparator` — customize separator for All Open Paths
- `grab.statusBarMessageDuration` — control feedback message duration
