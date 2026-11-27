# Vendored engine contract artifact

| Field | Value |
|---|---|
| File | `codeatlas-contracts-0.1.0.tgz` |
| Package | `@codeatlas/contracts` 0.1.0 (contract 0.1.0, protocol 0.1) |
| Source | `codeatlas-engine`, `packages/contracts` (`npm pack`), from the FND-03 change |
| SHA-256 | `d37f6a1ce91e42e30d515fbb82106dee904998f64a7568c8069c0655c5b71338` |

This is the immutable, versioned contract artifact the extension pins (ADR-0009 rule 3). `package.json` depends on it as `file:vendor/codeatlas-contracts-0.1.0.tgz`, and `package-lock.json` records its integrity hash. Only `src/adapters/engine` and `src/adapters/platform-api` may import it (ESLint and dependency-cruiser, ADR-0012 rule 4). Never edit the tarball or copy schema files out of it.

**Reproduce:** check out the engine at the same change, then run `cd packages/contracts && npm ci && npm pack`. The tarball is byte-identical.

**Update** (until registry releases arrive with DIST-01):

1. Take the `codeatlas-contracts` artifact from the engine CI run, or `npm pack` it yourself.
2. Put the new `codeatlas-contracts-<version>.tgz` here and delete the old one.
3. Run `npm install --save-exact ./vendor/codeatlas-contracts-<version>.tgz`.
4. Update this table, then run `npm run typecheck` and `npm run check:architecture`.
