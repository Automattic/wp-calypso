# AGENTS.md — @automattic/agenttic-demo

Private development playground for `agenttic-client` and `agenttic-ui`. Not deployed, not published.

```bash
yarn workspace @automattic/agenttic-demo run dev   # :3001
```

Scenarios are registered in `src/playground/demos.ts` and rendered by `PlaygroundShell`. There is
also a standalone `MessageTester`.

## Things that are deliberate

- **Vite aliases resolve to package _source_, not to the workspace packages.** Editing a component
  and seeing it reload is the entire point; resolving through the workspace would pull in `dist/`.
  `--mode use-ui-build` aliases the UI to `dist/` instead — use that to verify the built artifact.
- **This package is intentionally absent from `packages/tsconfig.json`.** Referencing it would fold
  the playground into `yarn typecheck-packages`, so any type error in demo code would turn CI red for
  everyone and anyone changing `agenttic-ui`'s API would have to fix the playground before merging.
  The playground is experimental by nature and should not gate the shared typecheck. Its
  `tsconfig.json` is standalone; check it by hand with
  `yarn tsc --noEmit -p packages/agenttic-demo`.

  Be warned that this check does **not** currently pass: it reports 48 errors, the same 48 it
  reported in the agenttic repo before the move (its `include` pulls in both packages' sources
  *and* their test files). Fixing them is a separate piece of work — which is precisely why this
  package is kept out of the shared typecheck.
- Port is 3001 because 3000 is Calypso's own `yarn start`.
- It points at `https://public-api.wordpress.com/wpcom/v2/ai/agent` with fixed session IDs — i.e.
  **production**.
- It introduces `vite` and `@vitejs/plugin-react` to Calypso, which otherwise builds with webpack.
  Accepted for now; revisit if the playground is replaced by Storybook.
