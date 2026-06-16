# Reader Spaces

Spaces group subscriptions under a name plus optional tags. v0 is dark-shipped
behind the `reader/spaces` feature flag and has **no backend yet** (epic
RSM-4110); creating a space only writes the React Query cache for now.

> See [`README.md`](./README.md) for the endpoints and contracts the client
> expects once the backend lands (and the placeholder-vs-real caching strategy).

## Layout

- **Model & data** — `@automattic/api-core` → `read-spaces/`: `ReadSpace`,
  `CreateReadSpaceParams`, `MAX_SPACE_NAME_LENGTH`, and the placeholder list
  returned by `fetchers.ts`. No JSX, no routes here — api-core stays serializable.
- **Queries & mutations** — `@automattic/api-queries` → `read-spaces.ts`:
  `readSpacesQuery`, `createReadSpaceMutation`. The create mutation is
  cache-only; `TODO(RSM-4139)` swaps in the real `POST`.
- **Consumer hooks** — `client/reader/data/spaces/`: `useSpaces`, `useCreateSpace`.
- **UI (this folder)** — `view.tsx`, `controller.tsx`, `index.tsx` (routes),
  `icons.ts`, `routes.ts`, `create-modal/`.
- **Sidebar entry point** — `client/reader/sidebar/spaces/`.

## Conventions

### File naming

- This folder is already `spaces/`, so **do not repeat `space`/`spaces` in file
  or folder names**: `view.tsx` (not `spaces-view.tsx`), `create-modal/` (not
  `create-space-modal/`), `menu-item.tsx` (not `space-menu-item.tsx`),
  `icons.ts`, `routes.ts`.
- Exported identifiers stay descriptive and qualified (`SpacesView`,
  `CreateSpaceModal`, `SPACE_ICONS`) — the redundancy rule is about file paths,
  not symbols.
- CSS class names keep a namespace prefix (`create-space-modal__…`,
  `sidebar-spaces__…`) because Calypso CSS is global; that prefix is not subject
  to the rule above.
- **Named exports only** — no `export default`. Two framework-mandated
  exceptions keep a default: the section entry `index.tsx` (the section loader
  calls `module.default`, see `client/sections-middleware.js`) and any module
  loaded via `AsyncLoad`, whose `require` must resolve to `{ default }` — map
  the named export in the loader instead (see `controller.tsx`:
  `import( './view' ).then( ( { SpacesView } ) => ( { default: SpacesView } ) )`).

### Model & presentation

- `ReadSpace` is serializable. Presentation settings live grouped under
  `layout` (a `SpaceLayout`) so they can grow beyond color/icon; `layout.color`
  and `layout.icon` are **string keys**, never rendered glyphs. Map
  `layout.icon` → a `@wordpress/icons` element via `SPACE_ICONS` in `icons.ts`;
  `layout.color` selects a CSS variant.
- Build Spaces URLs with `routes.ts` (`SPACES_BASE_PATH`, `getSpacePath`) —
  never hand-concatenate paths.

### Form

- The create form is a **single component**, `create-modal/index.tsx` — fields,
  validation, mutation, and actions inline. There is no generic/base form yet:
  **do not abstract one until edit (RSM-4117) actually needs it**, then extract
  the shared parts knowing their real shape. (We had a speculative
  `BaseSpaceForm`/wrapper split and deliberately collapsed it — resist
  re-adding it early.)
- Validation: name required, <= `MAX_SPACE_NAME_LENGTH`, and case-insensitive
  duplicate against the existing names. The duplicate message is rendered
  manually (`<p className="create-space-modal__error">`); we intentionally do
  not wire validation through a form abstraction.
- On success: append to the cache (via the mutation), fire a
  `calypso_reader_*` Tracks event, show a `successNotice`, then close.
- `TODO(RSM-4139)`: when the real backend lands, map its error kinds to copy
  where the generic `createSpace.isError` message is shown today.
- Forms use WordPress components and `useTranslate` from `i18n-calypso`.

### Data

- Follow the Reader three-layer pattern (see `../AGENTS.md`). Mutation factories
  in `@automattic/api-queries` take the consumer's `QueryClient`; the create
  mutation appends to `readSpacesQuery()` via `setQueryData`.
