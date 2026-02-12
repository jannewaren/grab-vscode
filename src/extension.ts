import * as vscode from "vscode";
import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

// --- Utilities ---

function getConfig() {
  return vscode.workspace.getConfiguration("grab");
}

function showStatus(message: string) {
  const duration = getConfig().get<number>("statusBarMessageDuration", 2000);
  vscode.window.setStatusBarMessage(message, duration);
}

function getFilePath(uri: vscode.Uri, style: "relative" | "absolute"): string {
  if (style === "absolute") {
    return uri.fsPath;
  }
  return vscode.workspace.asRelativePath(uri, false);
}

function validateEditor(): vscode.TextEditor | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    showStatus("$(error) No active editor");
    return undefined;
  }
  const { scheme } = editor.document.uri;
  if (scheme === "untitled") {
    showStatus("$(error) Save the file first");
    return undefined;
  }
  if (scheme !== "file") {
    showStatus("$(error) Not a file on disk");
    return undefined;
  }
  return editor;
}

function normalizeSelection(selection: vscode.Selection): {
  startLine: number;
  endLine: number;
} {
  const startLine = selection.start.line + 1;
  let endLine = selection.end.line + 1;

  // When selecting full lines, the cursor often ends at column 0 of the next line
  if (
    !selection.isEmpty &&
    selection.end.character === 0 &&
    selection.end.line > selection.start.line
  ) {
    endLine -= 1;
  }

  return { startLine, endLine };
}

function formatLineRange(selection: vscode.Selection): string {
  const { startLine, endLine } = normalizeSelection(selection);
  if (startLine === endLine) {
    return `:${startLine}`;
  }
  return `:${startLine}-${endLine}`;
}

function inferLanguageId(editor: vscode.TextEditor): string {
  const langId = editor.document.languageId;
  // Map vscode language IDs to common markdown fence labels
  const map: Record<string, string> = {
    typescriptreact: "tsx",
    javascriptreact: "jsx",
    shellscript: "bash",
    plaintext: "",
  };
  return map[langId] ?? langId;
}

async function git(
  cwd: string,
  ...args: string[]
): Promise<string | undefined> {
  try {
    const { stdout } = await exec("git", args, { cwd });
    return stdout.trim();
  } catch {
    return undefined;
  }
}

async function copyToClipboard(text: string, label: string) {
  await vscode.env.clipboard.writeText(text);
  showStatus(`$(check) Copied: ${label}`);
}

// --- Command Handlers ---

async function pathWithLine() {
  const editor = validateEditor();
  if (!editor) return;

  const style = getConfig().get<"relative" | "absolute">(
    "defaultPathStyle",
    "relative"
  );
  const filePath = getFilePath(editor.document.uri, style);
  const result = filePath + formatLineRange(editor.selection);
  await copyToClipboard(result, result);
}

async function fullPathWithLine() {
  const editor = validateEditor();
  if (!editor) return;

  const filePath = getFilePath(editor.document.uri, "absolute");
  const result = filePath + formatLineRange(editor.selection);
  await copyToClipboard(result, result);
}

async function copyPath() {
  const editor = validateEditor();
  if (!editor) return;

  const filePath = getFilePath(editor.document.uri, "relative");
  await copyToClipboard(filePath, filePath);
}

async function copyFullPath() {
  const editor = validateEditor();
  if (!editor) return;

  const filePath = getFilePath(editor.document.uri, "absolute");
  await copyToClipboard(filePath, filePath);
}

async function allOpenPaths() {
  const seen = new Set<string>();
  const paths: string[] = [];

  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      const input = tab.input;
      if (input instanceof vscode.TabInputText) {
        const uri = input.uri;
        if (uri.scheme !== "file") continue;
        const rel = vscode.workspace.asRelativePath(uri, false);
        if (!seen.has(rel)) {
          seen.add(rel);
          paths.push(rel);
        }
      }
    }
  }

  if (paths.length === 0) {
    showStatus("$(error) No open file tabs");
    return;
  }

  const separator = getConfig().get<string>("openPathsSeparator", "\n");
  const result = paths.join(separator);
  await copyToClipboard(result, `${paths.length} path(s)`);
}

async function codeWithContext() {
  const editor = validateEditor();
  if (!editor) return;

  if (editor.selection.isEmpty) {
    showStatus("$(error) Select some code first");
    return;
  }

  const filePath = getFilePath(editor.document.uri, "relative");
  const lineRange = formatLineRange(editor.selection);
  const lang = inferLanguageId(editor);
  const selectedText = editor.document.getText(editor.selection);

  const result = `${filePath}${lineRange}\n\`\`\`${lang}\n${selectedText}\n\`\`\``;
  await copyToClipboard(result, `${filePath}${lineRange}`);
}

async function symbolContext() {
  const editor = validateEditor();
  if (!editor) return;

  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    "vscode.executeDocumentSymbolProvider",
    editor.document.uri
  );

  if (!symbols || symbols.length === 0) {
    showStatus("$(error) No symbols found — is a language extension active?");
    return;
  }

  // Find the innermost symbol containing the cursor
  const pos = editor.selection.active;
  const symbol = findInnermostSymbol(symbols, pos);

  if (!symbol) {
    showStatus("$(error) No symbol at cursor position");
    return;
  }

  const filePath = getFilePath(editor.document.uri, "relative");
  const range = symbol.range;
  const startLine = range.start.line + 1;
  const endLine = range.end.line + 1;
  const lineRange = startLine === endLine ? `:${startLine}` : `:${startLine}-${endLine}`;
  const lang = inferLanguageId(editor);
  const text = editor.document.getText(range);

  const result = `${filePath}${lineRange} ${symbol.name}\n\`\`\`${lang}\n${text}\n\`\`\``;
  await copyToClipboard(result, `${symbol.name} (${filePath}${lineRange})`);
}

function findInnermostSymbol(
  symbols: vscode.DocumentSymbol[],
  pos: vscode.Position
): vscode.DocumentSymbol | undefined {
  for (const symbol of symbols) {
    if (symbol.range.contains(pos)) {
      // Check children for a more specific match
      const child = findInnermostSymbol(symbol.children, pos);
      return child ?? symbol;
    }
  }
  return undefined;
}

function formatDiagnostic(
  uri: vscode.Uri,
  d: vscode.Diagnostic
): string {
  const path = vscode.workspace.asRelativePath(uri, false);
  const line = d.range.start.line + 1;
  const severity = diagnosticSeverityLabel(d.severity);
  const source = d.source ? ` [${d.source}]` : "";
  return `${path}:${line}: ${severity}: ${d.message}${source}`;
}

function diagnosticSeverityLabel(s: vscode.DiagnosticSeverity): string {
  switch (s) {
    case vscode.DiagnosticSeverity.Error:
      return "error";
    case vscode.DiagnosticSeverity.Warning:
      return "warning";
    case vscode.DiagnosticSeverity.Information:
      return "info";
    case vscode.DiagnosticSeverity.Hint:
      return "hint";
  }
}

async function diagnosticsFile() {
  const editor = validateEditor();
  if (!editor) return;

  const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
  if (diagnostics.length === 0) {
    showStatus("$(check) No diagnostics for this file");
    return;
  }

  const lines = diagnostics.map((d) =>
    formatDiagnostic(editor.document.uri, d)
  );
  const result = lines.join("\n");
  await copyToClipboard(result, `${diagnostics.length} diagnostic(s)`);
}

async function diagnosticsAll() {
  const all = vscode.languages.getDiagnostics();
  const lines: string[] = [];

  for (const [uri, diagnostics] of all) {
    if (diagnostics.length === 0) continue;
    if (uri.scheme !== "file") continue;
    for (const d of diagnostics) {
      lines.push(formatDiagnostic(uri, d));
    }
  }

  if (lines.length === 0) {
    showStatus("$(check) No diagnostics in workspace");
    return;
  }

  const result = lines.join("\n");
  await copyToClipboard(result, `${lines.length} diagnostic(s)`);
}

async function remoteUrl() {
  const editor = validateEditor();
  if (!editor) return;

  const fsPath = editor.document.uri.fsPath;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    editor.document.uri
  );
  const cwd = workspaceFolder?.uri.fsPath ?? require("path").dirname(fsPath);

  // Get git remote URL
  const remoteRaw = await git(cwd, "remote", "get-url", "origin");
  if (!remoteRaw) {
    showStatus("$(error) No git remote found");
    return;
  }

  // Get current commit SHA for a permalink
  const sha = await git(cwd, "rev-parse", "HEAD");
  if (!sha) {
    showStatus("$(error) Not a git repository");
    return;
  }

  // Get the file path relative to the git repo root
  const repoRoot = await git(cwd, "rev-parse", "--show-toplevel");
  if (!repoRoot) {
    showStatus("$(error) Cannot determine repo root");
    return;
  }
  const relativePath = require("path").relative(repoRoot, fsPath);

  // Convert remote URL to HTTPS base
  const baseUrl = remoteToHttps(remoteRaw);
  if (!baseUrl) {
    showStatus("$(error) Unsupported remote format");
    return;
  }

  // Detect GitLab vs GitHub style
  const isGitLab = baseUrl.includes("gitlab");
  const { startLine, endLine } = normalizeSelection(editor.selection);

  let url: string;
  if (isGitLab) {
    const blobPath = `/-/blob/${sha}/${relativePath}`;
    const fragment =
      startLine === endLine ? `#L${startLine}` : `#L${startLine}-${endLine}`;
    url = `${baseUrl}${blobPath}${fragment}`;
  } else {
    // GitHub / default
    const blobPath = `/blob/${sha}/${relativePath}`;
    const fragment =
      startLine === endLine
        ? `#L${startLine}`
        : `#L${startLine}-L${endLine}`;
    url = `${baseUrl}${blobPath}${fragment}`;
  }

  await copyToClipboard(url, `remote URL`);
}

function remoteToHttps(remote: string): string | undefined {
  // SSH: git@github.com:user/repo.git
  const sshMatch = remote.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (sshMatch) {
    return `https://${sshMatch[1]}/${sshMatch[2]}`;
  }

  // HTTPS: https://github.com/user/repo.git
  const httpsMatch = remote.match(/^https?:\/\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    return `https://${httpsMatch[1]}`;
  }

  return undefined;
}

// --- Activation ---

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("grab.pathWithLine", pathWithLine),
    vscode.commands.registerCommand("grab.fullPathWithLine", fullPathWithLine),
    vscode.commands.registerCommand("grab.path", copyPath),
    vscode.commands.registerCommand("grab.fullPath", copyFullPath),
    vscode.commands.registerCommand("grab.allOpenPaths", allOpenPaths),
    vscode.commands.registerCommand("grab.codeWithContext", codeWithContext),
    vscode.commands.registerCommand("grab.symbolContext", symbolContext),
    vscode.commands.registerCommand("grab.diagnosticsFile", diagnosticsFile),
    vscode.commands.registerCommand("grab.diagnosticsAll", diagnosticsAll),
    vscode.commands.registerCommand("grab.remoteUrl", remoteUrl)
  );
}

export function deactivate() {}
