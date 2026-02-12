# Grab

Grab context from VSCode for external AI tools — paths, code snippets, symbol definitions, diagnostics, and remote URLs.

## Quick Start

| Shortcut | Command | What it copies |
|---|---|---|
| `Cmd+Shift+Alt+C` | Grab: Relative Path with Line | `src/file.ts:42` |
| `Cmd+Shift+Alt+X` | Grab: Code with Context | Path + fenced code block |

On Windows/Linux, use `Ctrl` instead of `Cmd`.

Type `Grab:` in the Command Palette to see all 11 commands.

## All Commands

| Command | Default Shortcut | Suggested Shortcut | Output |
|---|---|---|---|
| Relative Path with Line | `Cmd+Shift+Alt+C` | — | `src/file.ts:42` or `src/file.ts:42-50` |
| Full Path with Line | — | `Cmd+Shift+Alt+F` | `/Users/.../file.ts:42` |
| Relative Path | — | `Cmd+Shift+Alt+R` | `src/file.ts` |
| Full Path | — | `Cmd+Shift+Alt+A` | `/Users/.../file.ts` |
| All Open Paths | — | `Cmd+Shift+Alt+O` | Newline-separated relative paths |
| Code with Context | `Cmd+Shift+Alt+X` | — | Path + fenced code block |
| Symbol Context | — | `Cmd+Shift+Alt+S` | Full symbol definition + path |
| Diagnostics (File) | — | `Cmd+Shift+Alt+D` | Errors/warnings for current file |
| Diagnostics (All) | — | `Cmd+Shift+Alt+E` | Errors/warnings for entire workspace |
| Remote URL | — | `Cmd+Shift+Alt+G` | GitHub/GitLab permalink |
| Remote URL with Line | — | `Cmd+Shift+Alt+L` | GitHub/GitLab permalink with line/range anchor |

## Adding Keyboard Shortcuts

1. Open **Keyboard Shortcuts** with `Cmd+K Cmd+S`
2. Search for **"grab"**
3. Click the **+** icon next to the command you want to bind
4. Press your desired shortcut (e.g. `Cmd+Shift+Alt+F`)
5. Press **Enter** to confirm

On Windows/Linux, use **Ctrl** instead of **Cmd**.

## Examples

### Relative Path with Line

Place cursor on line 42:

```
src/utils/auth.ts:42
```

Select lines 10-25:

```
src/utils/auth.ts:10-25
```

### Code with Context

Select some code to get a markdown-ready snippet:

```
src/utils/auth.ts:10-15
```ts
export function validateToken(token: string): boolean {
  const decoded = decode(token);
  return decoded.exp > Date.now() / 1000;
}
```

### Symbol Context

Place cursor inside any function, class, or method to grab its full definition:

```
src/utils/auth.ts:10-15 validateToken
```ts
export function validateToken(token: string): boolean {
  const decoded = decode(token);
  return decoded.exp > Date.now() / 1000;
}
```

### Diagnostics

Copy errors and warnings with file locations, ready for "fix these" workflows:

```
src/auth.ts:15: error: Property 'token' does not exist on type 'User' [typescript]
src/auth.ts:42: warning: 'validate' is declared but never used [typescript]
```

### Remote URL

Generates a permalink to the file using the current commit SHA:

```
https://github.com/user/repo/blob/abc123/src/utils/auth.ts
```

### Remote URL with Line

Generates a permalink with line or range anchors:

```
https://github.com/user/repo/blob/abc123/src/utils/auth.ts#L10-L15
```

## Settings

| Setting | Default | Description |
|---|---|---|
| `grab.defaultPathStyle` | `"relative"` | `"relative"` or `"absolute"` for the default path command |
| `grab.openPathsSeparator` | `"\n"` | Separator for All Open Paths output |
| `grab.statusBarMessageDuration` | `2000` | Feedback message duration in ms |

## License

MIT
