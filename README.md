# CodeAtlas VS Code

The Visual Studio Code extension for CodeAtlas.

Responsibilities:
- Workspace detection
- Local engine integration
- JSON-RPC communication
- Architecture graph visualization
- Symbol exploration and source navigation

## Architecture

A light Clean Architecture ([ADR-0012](docs/adr/0012-vscode-extension-layering.md)): a small, host-free core with ports, and everything that touches VS Code or the engine process kept outside it.

```text
src/
├── core/            domain + application (use cases, ports); no `vscode` import
├── adapters/        engine (JSON-RPC, process lifecycle), vscode (settings, navigation, notifications), platform-api
├── presentation/    commands, providers, webview panel controllers
├── shared/          webview-protocol message types
└── extension.ts     composition root
webview-ui/          graph rendering front end
tests/               unit (core, no extension host), integration, architecture
```

See [`src/README.md`](src/README.md) for the import matrix.

## Build and checks

The Node version is pinned in `.node-version`; the minimum VS Code version is `engines.vscode` in `package.json`.

```sh
npm ci
npm run typecheck
npm run compile              # emits dist/extension.js
npm run check:architecture   # ESLint import bans + dependency-cruiser folder rules
```

CI (`.github/workflows/ci.yml`) runs the jobs `build` and `architecture`. Mark both as required in branch protection.

## Decision records

See [`docs/adr/`](docs/adr/README.md).
