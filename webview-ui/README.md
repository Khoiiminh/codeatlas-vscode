# webview-ui

Graph rendering front end that runs inside the VS Code Webview. Presentation only: rendering, filtering, node details and bounded expansion requests.

```text
src/
├── components/   graph canvas, node details, filters
├── state/        view state and graph view model cache
└── messaging/    postMessage bridge using ../src/shared/webview-protocol types
```

It never talks to the engine directly. All data flows through typed messages to the extension host (`src/presentation/webview`).
