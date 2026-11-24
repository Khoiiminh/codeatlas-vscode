# ADR-0012: VS Code extension core/adapters/presentation layering
- Status: Proposed
- Date: 2026-11-24
- Decision owners: VS Code extension maintainers
- Repository scope: vscode
- Supersedes: none
- Superseded by: none

## Context

`codeatlas-vscode` owns the editor-native integration (Architecture Blueprint v1.3 §1.3). That covers workspace detection, engine runtime discovery/installation, process lifecycle and compatibility negotiation, the JSON-RPC client, the graph Webview and source navigation. It must not own parsing, graph algorithms or a local database. Most of its code is integration and presentation, but some rules are worth testing in isolation: engine/protocol compatibility decisions, workspace state transitions, bounded graph expansion and reconnect behaviour.

The initial scaffold had `src/{commands,configuration,engine,providers,webview}` with no stated dependency direction.

## Problem

Extension code that calls the `vscode` API everywhere can only be tested inside the extension host, which is slow and flaky. Engine protocol changes and VS Code API changes then ripple through every command. Full Clean Architecture with many entity and use-case layers would be over-engineering for an extension of this size.

## Decision

Adopt a **light** Clean Architecture (Blueprint v1.3 §2.3):

| Layer | Location |
|---|---|
| Core domain | `src/core/domain` |
| Core application (use cases + ports) | `src/core/application`, `src/core/application/ports` |
| Adapters | `src/adapters/engine` (JSON-RPC, process lifecycle, discovery/installation), `src/adapters/vscode` (configuration, navigation, notifications), `src/adapters/platform-api` (optional hosted calls) |
| Presentation | `src/presentation/{commands,providers,webview}`, `webview-ui/` |
| Shared message types | `src/shared/webview-protocol` |
| Composition root | `src/extension.ts` |

Rules:

1. Dependencies point inward only. The matrix in [`src/README.md`](../../src/README.md) is normative.
2. `src/core/**` must not import `vscode`, Node process/filesystem APIs, `@codeatlas/contracts`, or anything under `adapters/` or `presentation/`.
3. Ports in `src/core/application/ports`: `EngineClient`, `EngineDistribution`, `SettingsStore`, `EditorNavigator`, `Notifier`, `ProgressSink`, `PlatformClient`.
4. Engine contract types are used only in `src/adapters/engine` (and `src/adapters/platform-api`) and are mapped there.
5. `webview-ui/` communicates with the host only through `src/shared/webview-protocol` messages and never talks to the engine.
6. Thin commands that only forward to the VS Code API, with no rules, may skip a use case.

Scaffold moves: `src/commands`, `src/providers` and `src/webview` → `src/presentation/*`; `src/engine` → `src/adapters/engine`; `src/configuration` → `src/adapters/vscode/configuration`.

## Alternatives considered

- **Feature folders calling the `vscode` API directly.** Simplest, but core rules are testable only in the extension host, and protocol changes spread everywhere. Rejected.
- **Full four-layer Clean Architecture with separate entity and use-case packages.** More structure than the extension's logic justifies. Rejected in favour of the light core.

## Consequences

- Positive: compatibility, lifecycle and graph-bounding rules are unit-tested without VS Code. Engine protocol changes stay inside `adapters/engine`. A future editor integration could reuse `core/` patterns.
- Negative: a little wiring in `extension.ts`, and port interfaces for VS Code services.
- Mitigation: keep `core/` small and allow thin commands to bypass use cases (rule 6).

## Implementation and verification

- FND-01: extension `package.json` and tsconfig paths matching the layout.
- FND-05: `npm run check:architecture` as the required CI job `architecture`. It runs two checks:
  - ESLint `no-restricted-imports` / `no-restricted-globals` (including a ban on `vscode` and Node under `src/core/**`) give in-editor feedback.
  - dependency-cruiser (`.dependency-cruiser.cjs`) enforces the folder matrix on resolved paths. `no-restricted-imports` matches import strings only, so on its own it cannot reliably tell sibling adapters apart.

  A deliberately introduced violation must fail CI. Verified on 2026-11-24: injected probes for `vscode` and `node:fs`/`process` in core, domain → application, adapter → adapter, presentation → adapter, importing `extension.ts`, and `webview-ui` → core were all rejected.
- IDE-01: compatibility rules in `core/domain` with unit tests in `tests/unit`. `EngineClient` is implemented in `adapters/engine`.
- IDE-02: Webview message types in `src/shared/webview-protocol`. `EditorNavigator` is implemented in `adapters/vscode/navigation`.

## Related records

- Architecture Blueprint v1.3 §1.3, §2
- Traceable Implementation Plan v1.2: FND-01, FND-05, IDE-01, IDE-02
- ADR-0005 (IPC), ADR-0007 (VS Code extension), ADR-0009 (multi-repository)
- Sibling layering decisions: ADR-0010 (`codeatlas-engine`), ADR-0011 (`codeatlas-platform`)
