# Extension source: layering

Decision record: [ADR-0012](../docs/adr/0012-vscode-extension-layering.md). This is a deliberately **light** Clean Architecture: a small, host-free `core/` with ports, and everything that touches VS Code or the engine process kept outside it.

```text
src/
├── core/                     NO `vscode` import, no Node process/fs APIs
│   ├── domain/               workspace state, engine compatibility rules, graph view model, bounds
│   └── application/          use cases: ResolveEngine, ConnectEngine, AnalyzeWorkspace, OpenGraph,
│       └── ports/            NavigateToSymbol, ...  Ports: EngineClient, EngineDistribution,
│                             SettingsStore, EditorNavigator, Notifier, ProgressSink, PlatformClient
├── adapters/
│   ├── engine/               JSON-RPC client, process lifecycle, discovery/installation (implements EngineClient, EngineDistribution)
│   ├── vscode/               configuration/ (SettingsStore), navigation/ (EditorNavigator), notifications/ (Notifier, ProgressSink)
│   └── platform-api/         optional authenticated hosted calls (PlatformClient)
├── presentation/
│   ├── commands/             command handlers -> use cases
│   ├── providers/            tree views, code lenses, etc. -> use cases
│   └── webview/              host-side Webview panel controllers
├── shared/
│   └── webview-protocol/     typed messages between the extension host and webview-ui
└── extension.ts              composition root: activate(), wiring adapters into use cases (IDE-01)
```

## Dependency matrix

✔ = allowed; blank = forbidden. Enforced in required CI (FND-05) by `npm run check:architecture`:
- ESLint ([`eslint.config.mjs`](../eslint.config.mjs)): `no-restricted-imports` / `no-restricted-globals` ban `vscode`, Node built-ins and globals, and `@codeatlas/contracts` under `src/core`, `src/shared` and `webview-ui`, and ban contracts in `src/presentation`;
- dependency-cruiser ([`.dependency-cruiser.cjs`](../.dependency-cruiser.cjs)): folder-to-folder rules for this table, plus no cycles.

Imports within the same adapter (for example `adapters/engine/*`) or the same presentation folder are allowed. Imports across sibling folders are not. Update both config files together with this table.

| Folder ↓ may import → | core/domain | core/application | adapters | presentation | shared | `vscode` |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| `core/domain` | | | | | | |
| `core/application` | ✔ | | | | | |
| `adapters/*` | ✔ | ✔ | | | | ✔ |
| `presentation/*` | ✔ | ✔ | | | ✔ | ✔ |
| `shared/*` | | | | | | |
| `extension.ts` | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| `webview-ui/` | | | | | ✔ | |

Contract types from `@codeatlas/contracts` are used only in `adapters/engine` (and `adapters/platform-api`) and are mapped to core types there.
