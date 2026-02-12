# Grab

Grab context from VSCode for external AI tools — paths, code snippets, symbol definitions, and remote URLs.

Type `Grab:` in the Command Palette to see all commands.

## Commands

| Shortcut | Command | Output |
|---|---|---|
| `Cmd+Shift+Alt+C` | Grab: Path with Line | `src/file.ts:42` or `src/file.ts:42-50` |
| `Cmd+Shift+Alt+F` | Grab: Full Path with Line | `/Users/.../file.ts:42` |
| `Cmd+Shift+Alt+R` | Grab: Relative Path | `src/file.ts` |
| `Cmd+Shift+Alt+A` | Grab: Full Path | `/Users/.../file.ts` |
| `Cmd+Shift+Alt+O` | Grab: All Open Paths | Newline-separated relative paths |
| `Cmd+Shift+Alt+X` | Grab: Code with Context | Path + fenced code block |
| `Cmd+Shift+Alt+S` | Grab: Symbol Context | Full symbol definition + path |
| `Cmd+Shift+Alt+G` | Grab: Remote URL | GitHub/GitLab permalink |

On Windows/Linux, use `Ctrl` instead of `Cmd`.

## Examples

### Path with Line

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

### Remote URL

Generates a permalink using the current commit SHA:

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
