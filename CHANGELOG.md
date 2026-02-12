# Changelog

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
