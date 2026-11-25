# ADR-0007: VS Code extension
- Status: Accepted
- Date: 2026-11-25
- Decision owners: VS Code maintainers
- Repository scope: vscode
- Supersedes: none
- Superseded by: none

## Context

The first editor integration must let developers explore the architecture graph of the repository they have open and jump from any graph node to its exact source location. VS Code is the most widely used editor for the initial TypeScript/JavaScript audience. The analysis itself is owned by the engine (ADR-0001, ADR-0009).

## Problem

An extension that parses code or stores its own graph would duplicate the engine and give different answers from the CLI. An extension that is tightly bound to one engine build would break whenever either side is released.

## Decision

The first editor integration is a **VS Code extension that is a thin client over the local engine runtime**:

1. It detects and validates the workspace. It then resolves a compatible engine distribution (a pinned version, or discovery and installation) and launches `codeatlas serve --stdio` (ADR-0005).
2. It declares a **supported engine/protocol range**, negotiates it in the handshake, and fails with a clear message on an unsupported version.
3. It renders the graph in a **Webview** (`webview-ui/`) that talks to the extension host only through typed messages (`src/shared/webview-protocol`). Graph expansion is bounded.
4. Selecting a node opens the **exact file and range** in the editor.
5. It **never** parses source, resolves semantics, builds graphs or keeps its own graph database.
6. Hosted features are reached only through authenticated platform APIs. The extension does not implement SaaS authorization policy.
7. Internal structure follows ADR-0012 (core / adapters / presentation).

## Alternatives considered

- **Analysis inside the extension (in TypeScript).** Duplicates the engine and diverges from the CLI. Rejected.
- **A Language Server Protocol server as the integration.** LSP has no model for graph views or snapshots. Not adopted; LSP features can be added later as another presentation surface.
- **Other editors first (JetBrains, Neovim).** A smaller initial audience. Deferred; the engine protocol keeps them possible.

## Consequences

- Positive: a small extension, the same results as the CLI, and independent Marketplace releases.
- Negative: the extension has to manage an external process lifecycle, version compatibility and engine installation.
- Mitigation: compatibility rules sit in `src/core/domain` and are unit-tested without the VS Code host, and lifecycle and reconnect handling lives in `src/adapters/engine` (IDE-01).

## Implementation and verification

- IDE-01: the extension starts and connects to a compatible runtime, fails clearly on an unsupported version, and has compatibility rules unit-tested without the extension host.
- IDE-02: a node opens the exact file and range, and graph expansion is bounded.
- INT-01: the engine↔VS Code compatibility matrix is tested on pinned versions.

## Related records

- Architecture Blueprint v1.3 §1.3, §3.3
- Traceable Implementation Plan v1.2: IDE-01, IDE-02, INT-01
- [ADR-0001](https://github.com/Khoiiminh/codeatlas-engine/blob/development/docs/adr/0001-multi-interface-platform.md) (interfaces), [ADR-0005](https://github.com/Khoiiminh/codeatlas-engine/blob/development/docs/adr/0005-inter-process-communication.md) (IPC), [ADR-0009](https://github.com/Khoiiminh/codeatlas-engine/blob/development/docs/adr/0009-multi-repository-architecture.md) (multi-repository), [ADR-0012](0012-vscode-extension-layering.md) (extension layering)
