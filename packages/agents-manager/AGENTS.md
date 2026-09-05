# Agents Manager Package

`@automattic/agents-manager` is the shared component library for WordPress.com's unified AI agent experience. It runs in Calypso, Simple sites, and Atomic sites — all from the same source.

## Cross-Repo Boundaries

- **Frontend** lives here (`packages/agents-manager/`) and is bundled by `apps/agents-manager/`.
- **Backend** lives in the Jetpack monorepo at `jetpack-mu-wpcom/src/features/agents-manager/`. New API endpoints or loading contexts require changes there, not here.
- **Extension providers** (like Big Sky) register via the PHP filter `agents_manager_agent_providers`. The loading flow crosses repos: PHP injects provider URLs → `loadExternalProviders()` dynamically imports them → they export `toolProvider`, `contextProvider`, etc. See `src/extension-types.ts` for the provider contract.
- **Chat runtime** comes from `@automattic/agenttic-client` (hooks, auth, message types) and `@automattic/agenttic-ui` (UI components, renderers). These are external NPM packages, not in this repo.

## Testing

```bash
# Unit tests (from repo root)
yarn jest -c test/packages/jest.config.js --testPathPattern=agents-manager

# Sandbox testing (Simple/Atomic)
cd apps/agents-manager && yarn dev --sync
# Then visit any site — only widgets.wp.com needs sandboxing, not the site itself
```

**Every PR** must include testing instructions for both Calypso (`yarn start`) and sandbox environments. See the PR template in `packages/help-center/AGENTS.md` for the pattern.

## Conventions

- **`@wordpress/*` for React APIs, generic UI, and icons**: in new code, import React APIs from `@wordpress/element` (keep bare `react` imports type-only), generic UI primitives from `@wordpress/components`, and icons from `@wordpress/icons` — matching the script externals WordPress registers on wp-admin/editor surfaces, where a different source ships a duplicate copy. Chat UI comes from `@automattic/agenttic-ui` (the chat runtime above); this rule is not a license to replace it or to churn existing compliant imports.
- **i18n**: Use `@wordpress/i18n` with the `__i18n_text_domain__` text domain placeholder — passed unquoted as it is a global constant, not a string literal. The webpack `DefinePlugin` replaces it with `'default'` at build time.
- **Curly quotes**: Preserve `“”` `‘’` exactly as they appear. Do not convert to unicode escapes or ASCII equivalents.

## Working in Heavily Shared Components

A heavily shared component is one rendered by multiple agent chats or surfaces — `components/orchestrator-chat` (the largest), `components/agent-chat`, `components/agent-dock`. They accrete cross-cutting logic fast, making changes — AI-generated ones most of all — hard to read and review. Target shape: a thin composition layer — hooks at the top, minimal glue, render at the bottom.

These rules are MUSTs, not suggestions. They apply to every change that adds or modifies state, effects, handlers, or behavior in such a component:

1. **One mechanism, one hook.** All state, refs, effects, and callbacks implementing a single behavior MUST live together in one custom hook under `src/hooks/`, named after the behavior (`use-image-upload`, `use-navigation-continuation` are the pattern). A mechanism's pieces MUST NOT be spread across the component body.
2. **New cross-cutting logic starts as a hook, not inline.** A change that adds a `useState` + `useEffect` + handler cluster to one of these components MUST extract it into a hook in the same PR. If a hook already owns that behavior, it MUST be extended — a parallel hook MUST NOT be added.
3. **Pure logic goes to `utils/`.** New logic with no React state — parsing, formatting, list transforms — MUST be a pure function with explicit inputs and outputs. When adding a stage to a multi-stage derivation (e.g. a large `useMemo` shaping the transcript), the stage MUST be a named pure function, so the derivation stays an ordered pipeline.
4. **Keep hook APIs narrow.** A hook MUST take explicit inputs and return only what callers use. When two mechanisms share state, it MUST be passed explicitly between them — never coupled through the component closure.
5. **One gate per surface difference.** Surface- or provider-specific behavior MUST be gated in a single place — a prop, a capability flag, the provider contract (`extension-types.ts`), or one derived value (as `isReaderChat` is) — and MUST NOT be re-tested with scattered ad-hoc conditionals through the body. Behavior owned by a provider MUST come through the contract, not be hardcoded in shared code.
6. **Changing existing behavior needs a blast-radius check.** A shared component's props, events, and observable behavior are a contract with every surface. Before changing or removing any, you MUST find all consumers — every chat entry, the `-disconnected` variants, and external providers if `extension-types.ts` is involved (see Pitfalls) — and confirm each still behaves as intended.
7. **Docblock the why.** Every hook MUST have a docblock stating which mechanism it implements and why it exists — the race, product behavior, or platform quirk. That context is what keeps grouped logic safe to move later.
8. **Shared weight is universal weight.** Any import added to shared code ships to every surface — you MUST check the Performance section before importing anything heavy.

Before finishing a change to one of these components, check the diff against each rule above.

## Performance

One source ships to every surface, so weight one surface needs is weight they all carry — `reader-chat` most of all, since it bundles its dependencies instead of externalizing them.

- **Heavy, surface-specific code MUST load on demand.** Components go through `lazyComponent()` (`utils/lazy-component.ts`); other modules take a gated dynamic `import()`, as `abilities/index.ts` does. A static import of `@wordpress/block-editor`, `blocks`, `core-data`, or `media-utils` MUST NOT be added anywhere in the shared chat path — it pulls that tree into every entry.
- **Changes that add a dependency or touch a lazy-loading seam MUST be measured before and after** — `webpack-bundle-analyzer`, or the per-entry sizes from `yarn build` in `apps/agents-manager`. Import chains are easy to misjudge by reading.

## Ability Scoping

AM ability registration (`registerAmAbilities()`) is called wherever the chat mounts, but the ability code is editor-only and lazy: `abilities/index.ts` is a thin facade, and the editor abilities in `abilities/editor-abilities.ts` load as an async chunk only on editor pages (`isEditorPage()`). Non-editor chats (Reader, wp-admin list screens, Calypso) never fetch it. Safety never depended on that gate — registration grants nothing:

- **The backend route settings are the scope authority** (`wpcom` repo, `lib/ai/agents/route-settings/wp-orchestrator/`): deny-by-default, per-URL allowlists rebuild each agent's tool set from scratch. Client-side registration and provider advertisement never make an ability callable.
- **Execution ownership comes from provider order, not the registry** — tool calls resolve through the provider chain first-write-wins by ability name, and `amToolProvider` is placed before the external providers. Registering an ability in the `@wordpress/abilities` registry alone does not route execution to it.
- **Migrating an ability = a folder under `src/abilities/` + an entry in `EDITOR_ABILITIES` (`abilities/editor-abilities.ts`) or, for light all-surface abilities, `ALL_SURFACE_ABILITIES` (`abilities/index.ts`)** — `amToolProvider` then executes it ahead of the provider's copy. Build results with `successResult()` / `errorResult()` from `abilities/ability-result.ts`; the backend acks echoing tools straight from that envelope, so its shape is a contract, not a local choice. If it renders a chat component, also add its type to `AM_COMPONENTS` in the converter, wrapped with the `lazyComponent()` helper (`utils/lazy-component.ts`).
- **Keep the ability code lazy** — heavy editor abilities and their dependencies land in `abilities/editor-abilities.ts` (never as static imports of the facade or shared chat code), and chat components load through the converter's `AM_COMPONENTS` map via `lazyComponent()`. A light all-surface ability lands in the facade's `ALL_SURFACE_ABILITIES` list instead, as `wp-admin-navigate` does — the chunk exists to keep the editor stack out of every bundle, not to gate every ability. All-surface abilities skip registry registration entirely; execution ownership comes from the provider chain. In jsdom tests, open the gate by adding the `site-editor-php` body class before exercising the facade (see the loader suite).
- **Test both implementations with `?am_abilities=0`** — the switch flips execution, registration, and rendering of the editor abilities to the provider copies in one move, and skips loading the abilities chunk entirely. All-surface abilities are exempt: they are fully migrated with no provider fallback.
- **Never rename an ability while migrating it** — the name is the key the route settings match on; renaming silently drops it from every surface.
- **Guard mutating callbacks in place**: when migrating a callback that changes editor state, start it with an `isEditorPage()` early-return that returns an error result, as `set-site-logo` does. Callbacks that don't mutate editor state (e.g. `show-component`, which only records a checkpoint) need no guard.
- **Validate the arguments in the callback** — `executeAbilityFromList` hands the raw wire arguments straight to `ability.callback( args )`, so the `input_schema` polices nothing at runtime: a stringified `"false"` reads as truthy, and a non-string value can reach `message`, which the output schema types as a string. Normalize what you use (`typeof summary === 'string' && summary.trim()`, strict `=== true` for booleans), as `editor-navigate`, `show-component` and `set-site-logo` do.
- **An ability that needs React context gets a bridge, not a hook** — callbacks are plain functions, so anything only reachable from a hook (the site editor's router history, for `editor-navigate`) is published into a module by a small component rendered on that surface, and read back by the callback. `components/editor-history-bridge` + `utils/editor-history.ts` are the pattern; keep the component lazy so its imports stay off the shared chat path.
- **Checkpoint domains land with their abilities** — `utils/checkpoints.ts` snapshots and restores only the migrated domains (global styles and the site logo today); a migrating ability that writes checkpoints brings its domain's snapshot/restore along, with scoped keys. Until every writer migrates, provider-held checkpoints stay restorable through the `provider-checkpoints` bridge, which shrinks away per ability.
- **Per migration, grep the route-settings files** for the ability name to confirm which surfaces expose it.
- **Sweep Big Sky's latest before landing** — the Big Sky copies keep evolving while a migration PR is open. Run `git log <last-reviewed-commit>..origin/trunk -- <migrated paths>` in the Big Sky repo, port what applies (behavior, fixes, Tracks events, logs), and record the reviewed commit in the PR or ticket so the next sweep starts there.
- **Mark transitional code with `TODO (ability-migration):`** — the shared prefix surfaces all migration cleanup in one grep, whichever ticket owns it.

## Pitfalls

- **Two deployment targets**: Every change must work in both Calypso (SPA) and Simple/Atomic (via `widgets.wp.com` bundles). They use different bootstrap paths.
- **Async chunks resolve from the entry script's URL** (webpack `publicPath: "auto"`): the abilities chunk and any new lazy seam must be verified on both targets plus the inlined `reader-chat` bundle — a chunk that 404s fails silently as a missing feature, not an error page. All entries share `dist/`, so chunk filenames and the chunk-loading global are entry-unique (`output-chunk-filename` + `chunkLoadingGlobal` per config) — a same-named chunk from another entry's build would overwrite it.
- **asset.json sync gap**: Adding/removing `@wordpress/*` dependencies changes `.asset.json` files, which Jetpack fetches from production — not your sandbox. Dependency changes require a deploy to take effect on Atomic.
- **Unregistered script handles**: `@wordpress/*` packages WordPress doesn't register as scripts (e.g. `@wordpress/abilities`, `@wordpress/ui`) must stay force-bundled in `apps/agents-manager/webpack.config.js` — an externalized unregistered dependency makes `WP_Scripts` silently drop the whole bundle.
- **Disconnected variants**: Several entry points have `-disconnected` versions showing minimal UI. Changes to shared code can silently break these.
- **Help Center dequeue**: On Gutenberg pages, the Agents Manager dequeues Help Center scripts to prevent duplicate UI. If debugging missing Help Center behavior, check this interaction.
- **Extension interface changes**: Modifying `extension-types.ts` affects all provider plugins (Big Sky, etc.) across repos.
