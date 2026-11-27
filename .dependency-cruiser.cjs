// Folder-level architecture boundary rules for codeatlas-vscode (FND-05, ADR-0012).
// Source-level counterpart of the matrix in src/README.md. `vscode`, Node and contract
// import bans are in eslint.config.mjs. Run: `npm run check:imports`.

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: "core-domain-is-innermost",
            comment: "src/core/domain imports nothing outside itself.",
            severity: "error",
            from: { path: "^src/core/domain/" },
            to: { path: "^(src|webview-ui)/", pathNot: "^src/core/domain/" },
        },
        {
            name: "core-application-depends-only-on-domain",
            comment: "src/core/application imports itself and src/core/domain only.",
            severity: "error",
            from: { path: "^src/core/application/" },
            to: { path: "^(src|webview-ui)/", pathNot: "^src/core/" },
        },
        {
            name: "core-has-no-node-builtins",
            comment: "src/core runs without the extension host or Node (ADR-0012 rule 2).",
            severity: "error",
            from: { path: "^src/core/" },
            to: { dependencyTypes: ["core"] },
        },
        {
            name: "adapters-depend-on-core-only",
            comment: "An adapter imports src/core and itself; adapters never import each other.",
            severity: "error",
            from: { path: "^src/adapters/([^/]+)/" },
            to: { path: "^(src|webview-ui)/", pathNot: "^src/(core/|adapters/$1/)" },
        },
        {
            name: "presentation-depends-on-core-and-shared",
            comment: "Presentation calls core use cases and uses shared message types; it never imports adapters.",
            severity: "error",
            from: { path: "^src/presentation/([^/]+)/" },
            to: { path: "^(src|webview-ui)/", pathNot: "^src/(core/|shared/|presentation/$1/)" },
        },
        {
            name: "shared-is-standalone",
            comment: "src/shared holds plain message types used by both the host and webview-ui.",
            severity: "error",
            from: { path: "^src/shared/" },
            to: { path: "^(src|webview-ui)/", pathNot: "^src/shared/" },
        },
        {
            name: "webview-ui-talks-through-shared-protocol",
            comment: "webview-ui reaches the host only via src/shared/webview-protocol messages (ADR-0012 rule 5).",
            severity: "error",
            from: { path: "^webview-ui/" },
            to: { path: "^src/", pathNot: "^src/shared/" },
        },
        {
            name: "composition-root-is-not-imported",
            comment: "src/extension.ts wires everything; nothing imports it.",
            severity: "error",
            from: {},
            to: { path: "^src/extension\\.ts$" },
        },
        {
            name: "contracts-only-in-engine-adapters",
            comment: "Engine contract types are mapped in adapters/engine and adapters/platform-api (ADR-0012 rule 4).",
            severity: "error",
            from: { pathNot: "^src/(adapters/(engine|platform-api)/|extension\\.ts$)" },
            to: { path: "node_modules/@codeatlas/contracts/" },
        },
        {
            name: "no-circular",
            severity: "error",
            from: {},
            to: { circular: true },
        },
        {
            name: "not-to-unresolvable",
            severity: "error",
            from: {},
            to: { couldNotResolve: true, pathNot: "^vscode$" },
        },
    ],
    options: {
        doNotFollow: { path: "node_modules" },
        // Only build output is excluded. node_modules must stay in the graph (it is not followed, see
        // doNotFollow), otherwise rules such as contracts-only-in-engine-adapters can never fire.
        exclude: { path: "^(dist|coverage)/" },
        tsPreCompilationDeps: true,
        tsConfig: { fileName: "tsconfig.json" },
        enhancedResolveOptions: {
            exportsFields: ["exports"],
            conditionNames: ["import", "require", "node", "default", "types"],
            extensions: [".ts", ".tsx", ".js", ".json"],
        },
    },
};
