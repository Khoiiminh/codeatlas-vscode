// ESLint flat config. The import bans below are part of the FND-05 boundary checks (ADR-0012);
// folder-to-folder rules live in .dependency-cruiser.cjs.
import { builtinModules } from "node:module";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

const NODE_BUILTINS = {
  regex: `^(node:.*|(${builtinModules.map((m) => m.replace("/", "\\/")).join("|")})(\\/.*)?)$`,
  message: "Node built-ins are not allowed here; go through a port implemented in src/adapters (ADR-0012).",
};
const VSCODE = {
  name: "vscode",
  message: "The VS Code API is not allowed here; go through a port implemented in src/adapters (ADR-0012).",
};
const CONTRACTS = {
  name: "@codeatlas/contracts",
  message: "Engine contract types are used only in src/adapters/engine and src/adapters/platform-api (ADR-0012 rule 4).",
};
const NODE_GLOBALS = ["process", "Buffer", "require", "__dirname", "__filename", "global"].map((name) => ({
  name,
  message: "Node globals are not allowed here (ADR-0012).",
}));

export default tseslint.config(
  { ignores: ["dist/", "node_modules/", "coverage/", "*.cjs"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    // Host-free core: no VS Code API, no Node, no wire contracts.
    files: ["src/core/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { paths: [VSCODE, CONTRACTS], patterns: [NODE_BUILTINS] }],
      "no-restricted-globals": ["error", ...NODE_GLOBALS],
    },
  },
  {
    // Message types shared with the browser-side webview: plain data only.
    files: ["src/shared/**/*.ts", "webview-ui/**/*.ts", "webview-ui/**/*.tsx"],
    rules: {
      "no-restricted-imports": ["error", { paths: [VSCODE, CONTRACTS], patterns: [NODE_BUILTINS] }],
      "no-restricted-globals": ["error", ...NODE_GLOBALS],
    },
  },
  {
    // Presentation reaches the engine only through core use cases.
    files: ["src/presentation/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { paths: [CONTRACTS] }],
    },
  },
);
