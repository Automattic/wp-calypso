# Agents Manager Package

`@automattic/agents-manager` is the shared component library for WordPress.com's unified AI agent experience. It runs in Calypso, Simple sites, Atomic sites, and CIAB — all from the same source.

## Cross-Repo Boundaries

- **Frontend** lives here (`packages/agents-manager/`) and is bundled by `apps/agents-manager/`.
- **Backend** lives in the Jetpack monorepo at `jetpack-mu-wpcom/src/features/agents-manager/`. New API endpoints or loading contexts require changes there, not here.
- **Extension providers** (like Big Sky) register via the PHP filter `agents_manager_agent_providers`. The loading flow crosses repos: PHP injects provider URLs → `loadExternalProviders()` dynamically imports them → they export `toolProvider`, `contextProvider`, etc. See `src/extension-types.ts` for the provider contract.
- **Chat runtime** comes from `@automattic/agenttic-client` (hooks, auth, message types) and `@automattic/agenttic-ui` (UI components, renderers). These are external NPM packages, not in this repo.

## Testing

```bash
# Unit tests (from repo root)
yarn jest -c test/packages/jest.config.js --testPathPattern=agents-manager

# Sandbox testing (Simple/Atomic/CIAB)
cd apps/agents-manager && yarn dev --sync
# Then visit any site — only widgets.wp.com needs sandboxing, not the site itself
```

**Every PR** must include testing instructions for both Calypso (`yarn start`) and sandbox environments. See the PR template in `packages/help-center/AGENTS.md` for the pattern.

## Conventions

- **i18n**: Use `@wordpress/i18n` with text domain `'__i18n_text_domain__'`. This placeholder is replaced at build time.
- **Curly quotes**: Preserve `""` `''` exactly as they appear. Do not convert to unicode escapes or ASCII equivalents.

## Pitfalls

- **Two deployment targets**: Every change must work in both Calypso (SPA) and Simple/Atomic/CIAB (via `widgets.wp.com` bundles). They use different bootstrap paths.
- **asset.json sync gap**: Adding/removing `@wordpress/*` dependencies changes `.asset.json` files, which Jetpack fetches from production — not your sandbox. Dependency changes require a deploy to take effect on Atomic.
- **Disconnected variants**: Several entry points have `-disconnected` versions showing minimal UI. Changes to shared code can silently break these.
- **Help Center dequeue**: On Gutenberg pages, the Agents Manager dequeues Help Center scripts to prevent duplicate UI. If debugging missing Help Center behavior, check this interaction.
- **Extension interface changes**: Modifying `extension-types.ts` affects all provider plugins (Big Sky, etc.) across repos.
