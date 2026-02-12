# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Grab** — a VSCode extension that copies context (paths, code, diagnostics, URLs) to the clipboard for pasting into external AI tools. Zero runtime dependencies, single-file architecture.

## Build Commands

```bash
npm run compile          # Bundle src/extension.ts → dist/extension.js
npm run watch            # Watch mode (auto-rebuild on save)
npx @vscode/vsce package --allow-missing-repository  # Build .vsix for distribution
```

To test: open project in VSCode, press F5 to launch Extension Development Host.

## Architecture

Everything lives in `src/extension.ts` (~400 lines). The file is structured as:

1. **Utilities** — `validateEditor()`, `getFilePath()`, `normalizeSelection()`, `formatLineRange()`, `copyToClipboard()`, `inferLanguageId()`, `git()`
2. **Command handlers** — one async function per command (10 total)
3. **`activate()`** — registers all commands

All commands follow the same pattern: validate editor → build string → copy to clipboard → show status bar feedback.

The `package.json` manifest declares commands, keybindings (`Cmd/Ctrl+Shift+Alt+<key>`), and three user settings under the `grab.*` namespace.

Bundled with esbuild (config in `esbuild.js`). Output is a single `dist/extension.js` (CommonJS). The `vscode` module is marked external.

## Key Conventions

- **Line numbers are 1-indexed** in output but 0-indexed in VSCode's API — every conversion adds `+ 1`
- **Selection normalization**: when a selection ends at column 0 of the next line (full-line select behavior), subtract 1 from end line
- **Git commands** use `child_process.execFile` (not `exec`) and return `undefined` on failure — callers check for `undefined`
- **Remote URL parsing** handles SSH (`git@host:user/repo.git`) and HTTPS formats, with GitHub vs GitLab line anchor differences
- **Status bar messages** use VSCode's codicon syntax (e.g., `$(error)`, `$(check)`)
- **Language IDs** are mapped for markdown fences: `typescriptreact→tsx`, `javascriptreact→jsx`, `shellscript→bash`
- **Diagnostics format**: `path:line: severity: message [source]` — intentionally matches file:line convention for AI consumption

## Adding a New Command

1. Write the async handler function in `src/extension.ts`
2. Register it in `activate()` with `vscode.commands.registerCommand("grab.<id>", handler)`
3. Add command entry + keybinding in `package.json` under `contributes.commands` and `contributes.keybindings`
4. All keybindings use the triple-modifier pattern: `Ctrl+Shift+Alt` (Win/Linux) / `Cmd+Shift+Alt` (Mac)
