# Tests

- `unit/`: tests for `src/core/**` with in-memory port fakes. Must run **without** the VS Code extension host.
- `integration/`: extension-host tests (activation, commands, engine connection, navigation).
- `architecture/`: reserved for boundary tests that need code. The import-boundary checks themselves (FND-05) are configured at the repository root (`eslint.config.mjs`, `.dependency-cruiser.cjs`) and run with `npm run check:architecture`, matching the matrix in [`src/README.md`](../src/README.md).
