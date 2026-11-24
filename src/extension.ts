import type * as vscode from "vscode";

// Composition root (ADR-0012): constructs adapters, injects them into core use cases,
// and registers presentation (commands, providers, webview). Wiring arrives with IDE-01.

export function activate(_context: vscode.ExtensionContext): void {}

export function deactivate(): void {}
