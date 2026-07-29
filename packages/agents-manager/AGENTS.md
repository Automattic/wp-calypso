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

- **i18n**: Use `@wordpress/i18n` with the `__i18n_text_domain__` text domain placeholder — passed unquoted as it is a global constant, not a string literal. The webpack `DefinePlugin` replaces it with `'default'` at build time.
- **Curly quotes**: Preserve `""` `''` exactly as they appear. Do not convert to unicode escapes or ASCII equivalents.

## Ability Scoping

AM ability registration (`registerAmAbilities()`) is surface-agnostic by design — it runs wherever the chat mounts, and that is safe because registration grants nothing:

- **The backend route settings are the scope authority** (`wpcom` repo, `lib/ai/agents/route-settings/wp-orchestrator/`): deny-by-default, per-URL allowlists rebuild each agent's tool set from scratch. Client-side registration and provider advertisement never make an ability callable.
- **Execution ownership comes from provider order, not the registry** — tool calls resolve through the provider chain first-write-wins by ability name, and `amToolProvider` is placed before the external providers. Registering an ability in the `@wordpress/abilities` registry alone does not route execution to it.
- **Migrating an ability = a folder under `src/abilities/` + an `AM_ABILITIES` entry** — `amToolProvider` then executes it ahead of the provider's copy. If it renders a chat component, also add its type to `AM_COMPONENTS` in the converter.
- **Test both implementations with `?am_abilities=0`** — the switch flips execution, registration, and rendering to the provider copies in one move.
- **Never rename an ability while migrating it** — the name is the key the route settings match on; renaming silently drops it from every surface.
- **Guard mutating callbacks in place**: when migrating a callback that changes editor state (e.g. `apply-block-edits`, `set-styles`), start it with an `isEditorPage()` early-return that returns an error result. Callbacks that don't mutate editor state (e.g. `show-component`, which only records a checkpoint) need no guard.
- **Per migration, grep the route-settings files** for the ability name to confirm which surfaces expose it.
- **Sweep Big Sky's latest before landing** — the Big Sky copies keep evolving while a migration PR is open. Run `git log <last-reviewed-commit>..origin/trunk -- <migrated paths>` in the Big Sky repo, port what applies (behavior, fixes, Tracks events, logs), and record the reviewed commit in the PR or ticket so the next sweep starts there.
- **Mark transitional code with `TODO (ability-migration):`** — the shared prefix surfaces all migration cleanup in one grep, whichever ticket owns it.

## Pitfalls

- **Two deployment targets**: Every change must work in both Calypso (SPA) and Simple/Atomic/CIAB (via `widgets.wp.com` bundles). They use different bootstrap paths.
- **asset.json sync gap**: Adding/removing `@wordpress/*` dependencies changes `.asset.json` files, which Jetpack fetches from production — not your sandbox. Dependency changes require a deploy to take effect on Atomic.
- **Unregistered script handles**: `@wordpress/*` packages WordPress doesn't register as scripts (e.g. `@wordpress/abilities`, `@wordpress/ui`) must stay force-bundled in `apps/agents-manager/webpack.config.js` — an externalized unregistered dependency makes `WP_Scripts` silently drop the whole bundle.
- **Disconnected variants**: Several entry points have `-disconnected` versions showing minimal UI. Changes to shared code can silently break these.
- **Help Center dequeue**: On Gutenberg pages, the Agents Manager dequeues Help Center scripts to prevent duplicate UI. If debugging missing Help Center behavior, check this interaction.
- **Extension interface changes**: Modifying `extension-types.ts` affects all provider plugins (Big Sky, etc.) across repos.
