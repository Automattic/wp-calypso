# Agents Manager Package

`@automattic/agents-manager` is the shared component library for WordPress.com's AI agent experience. It runs in Calypso, Simple sites, and Atomic sites — all from the same source.

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
- **Docs move with the code**: any change to code, styles, config, or behavior MUST update every doc that describes it, in the same PR — `README.md` and `AGENTS.md` files, other Markdown docs, docblocks, and comments. Find them by searching for the names you changed (files, exports, props, classes, flags) instead of relying on memory, and check the docs again before finishing.

## Working in Heavily Shared Components

A heavily shared component is one rendered by multiple agent chats or surfaces — `components/orchestrator-chat` (the largest), `components/agent-chat`, `components/agent-dock`. They accrete cross-cutting logic fast, making changes — AI-generated ones most of all — hard to read and review. Target shape: a thin composition layer — hooks at the top, minimal glue, render at the bottom.

These rules are MUSTs, not suggestions. They apply to every change that adds or modifies state, effects, handlers, or behavior in such a component:

1. **One mechanism, one hook.** All state, refs, effects, and callbacks implementing a single behavior MUST live together in one custom hook under `src/hooks/`, named after the behavior (`use-image-upload`, `use-navigation-continuation` are the pattern). A mechanism's pieces MUST NOT be spread across the component body.
2. **New cross-cutting logic starts as a hook, not inline.** A change that adds a `useState` + `useEffect` + handler cluster to one of these components MUST extract it into a hook in the same PR. If a hook already owns that behavior, it MUST be extended — a parallel hook MUST NOT be added.
3. **Pure logic goes to `utils/`.** New logic with no React state — parsing, formatting, list transforms — MUST be a pure function with explicit inputs and outputs. When adding a stage to a multi-stage derivation (e.g. a large `useMemo` shaping the transcript), the stage MUST be a named pure function, so the derivation stays an ordered pipeline.
4. **Keep hook APIs narrow.** A hook MUST take explicit inputs and return only what callers use. When two mechanisms share state, it MUST be passed explicitly between them — never coupled through the component closure.
5. **One gate per surface difference.** Surface- or provider-specific behavior MUST be gated in a single place — a prop, a capability flag, the provider contract (`extension-types.ts`), or one derived value (as `isReaderChat` is) — and MUST NOT be re-tested with scattered ad-hoc conditionals through the body. Behavior owned by a provider MUST come through the contract, not be hardcoded in shared code.
6. **Changing existing behavior needs a blast-radius check.** A shared component's props, events, and observable behavior are a contract with every surface. Before changing or removing any, you MUST find all consumers — every chat entry, the `gutenberg-disconnected` variant, and external providers if `extension-types.ts` is involved (see Pitfalls) — and confirm each still behaves as intended.
7. **Docblock the why.** Every hook MUST have a docblock stating which mechanism it implements and why it exists — the race, product behavior, or platform quirk. That context is what keeps grouped logic safe to move later.
8. **Shared weight is universal weight.** Any import added to shared code ships to every surface — you MUST check the Performance section before importing anything heavy.

Before finishing a change to one of these components, check the diff against each rule above.

## Performance

One source ships to every surface, so weight one surface needs is weight they all carry — `reader-chat` most of all, since it bundles its dependencies instead of externalizing them.

- **Heavy, surface-specific code MUST load on demand.** Components go through `lazyComponent()` (`utils/lazy-component.ts`); other modules take a gated dynamic `import()`, as `abilities/index.ts` does. A static import of `@wordpress/block-editor`, `blocks`, `core-data`, or `media-utils` MUST NOT be added anywhere in the shared chat path — it pulls that tree into every entry.
- **Changes that add a dependency or touch a lazy-loading seam MUST be measured before and after** — `webpack-bundle-analyzer`, or the per-entry sizes from `yarn build` in `apps/agents-manager`. Import chains are easy to misjudge by reading.

## Ability Scoping

The editor abilities (`abilities/editor-abilities.ts`) load as an async chunk on editor pages only, behind the facade in `abilities/index.ts`.

- **The backend route settings decide scope** (`wpcom` repo, `lib/ai/agents/route-settings/wp-orchestrator/`). Client-side registration never makes an ability callable.
- **Provider order decides execution** — tool calls resolve first-write-wins by ability name, and `amToolProvider` runs first.
- **Adding an ability**: a folder under `src/abilities/` plus an entry in `EDITOR_ABILITIES`, or in the facade's `ALL_SURFACE_ABILITIES` for a light ability every surface needs. Shared chat code reaches the editor chunk only through the facade. Chat components go in the converter's `AM_COMPONENTS`, through `lazyComponent()` when they carry editor code.
- **Return `successResult()` / `errorResult()`** (`abilities/ability-result.ts`) — the backend reads that envelope.
- **Never rename an ability** — the route settings match on the name, so a rename silently drops it everywhere.
- **Guard callbacks that change editor state** with an `isEditorPage()` early return, as `set-site-logo` does.
- **Validate arguments in the callback** — nothing enforces the `input_schema` at runtime: a stringified `"false"` is truthy, and an empty object arrives as `[]`.
- **Resolve block ids with `resolveClientId()`** — the agent knows blocks by the short ids AM's page context hands out (`utils/block-ids.ts`).
- **Take checkpoints through `withCheckpoint()`** (`utils/checkpoints.ts`). A new domain needs a scoped key, a snapshot/restore and redo support. A batch calls `recorder.markWritten()` for each domain it changes and returns a partial failure instead of throwing, so the checkpoint survives.

## Pitfalls

- **Two deployment targets**: Every change must work in both Calypso (SPA) and Simple/Atomic (via `widgets.wp.com` bundles). They use different bootstrap paths.
- **Async chunks resolve from the entry script's URL** (webpack `publicPath: "auto"`): the abilities chunk and any new lazy seam must be verified on both targets plus the inlined `reader-chat` bundle — a chunk that 404s fails silently as a missing feature, not an error page. All entries share `dist/`, so chunk filenames and the chunk-loading global are entry-unique (`output-chunk-filename` + `chunkLoadingGlobal` per config) — a same-named chunk from another entry's build would overwrite it.
- **asset.json sync gap**: Adding/removing `@wordpress/*` dependencies changes `.asset.json` files, which Jetpack fetches from production — not your sandbox. Dependency changes require a deploy to take effect on Atomic.
- **Unregistered script handles**: `@wordpress/*` packages WordPress doesn't register as scripts (e.g. `@wordpress/abilities`, `@wordpress/ui`) must stay force-bundled in `apps/agents-manager/webpack.config.js` — an externalized unregistered dependency makes `WP_Scripts` silently drop the whole bundle.
- **Disconnected variant**: The `gutenberg-disconnected` entry point shows minimal UI. Changes to shared code can silently break it.
- **Help Center dequeue**: On Gutenberg pages, the Agents Manager dequeues Help Center scripts to prevent duplicate UI. If debugging missing Help Center behavior, check this interaction.
- **Extension interface changes**: Modifying `extension-types.ts` affects all provider plugins (Big Sky, etc.) across repos.
