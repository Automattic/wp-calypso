# Agenttic Demo

`@automattic/agenttic-demo` — private development playground for `agenttic-client` and `agenttic-ui`. Not published, not deployed.

## Commands

```bash
# Run the playground on http://localhost:3001
yarn workspace @automattic/agenttic-demo run dev

# Run against agenttic-ui's built output instead of its source
yarn workspace @automattic/agenttic-demo run dev --mode use-ui-build

# Type check (not part of `yarn typecheck-packages` — see below)
yarn tsc --noEmit -p packages/agenttic-demo
```

## Conventions

- **Deliberately excluded from `packages/tsconfig.json`.** Referencing it would fold the
  playground into `yarn typecheck-packages`, so any type error here would turn CI red for
  everyone and force anyone changing `agenttic-ui`'s API to fix the playground before
  merging. The playground is experimental by nature and should not gate the shared
  typecheck. Run the type check by hand if you want it.
- **Keep the vite aliases in `vite.config.ts`.** They point at the two packages' `src/`,
  which is what makes edit-source-and-reload work. Replacing them with workspace
  resolution would resolve to `dist/` and destroy the playground's entire purpose.
- **Port 3001**, because 3000 collides with Calypso's `yarn start`.
- **This package introduces vite to Calypso**, which otherwise uses webpack only.
- The playground talks to `https://public-api.wordpress.com/wpcom/v2/ai/agent` with fixed
  session IDs — that is production, not a sandbox.
