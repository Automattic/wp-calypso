# Agenttic Client

`@automattic/agenttic-client` — TypeScript client for the Automattic agent framework. See `README.md` for API and usage.

## Commands

```bash
# Build (vite + declarations)
yarn workspace @automattic/agenttic-client run build

# Type check
yarn workspace @automattic/agenttic-client run type-check

# Run tests (vitest, not Calypso's jest)
yarn workspace @automattic/agenttic-client run test

# Lint
yarn eslint packages/agenttic-client/src/<file>
```

## Conventions

- **`agenttic-ui` does not import this package.** It hand-mirrors the types it needs in
  `packages/agenttic-ui/src/types/index.ts`. Changing an exported shape here does not
  break the UI package's typecheck — nothing verifies the two sides agree, so update the
  mirror by hand and exercise `agenttic-demo` to catch drift.
- **Version lockstep with `agenttic-ui` is convention only.** No script, hook, or CI
  enforces it. External consumers stay in sync via caret ranges plus their own lockfiles.
- **License.** MIT, not Calypso's usual GPL-2.0-or-later. The root `.eslintrc.js` carries
  an explicit exception for this.
