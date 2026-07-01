# Reader Spaces

Spaces group followed feeds (the client calls them `sources`) and tags under a
name. Dark-shipped behind the `reader/spaces` feature flag (epic RSM-4110), a8c
only, and wired to the real `wpcom/v2` backend.

> See [`README.md`](./README.md) for the full endpoint contract, data shapes,
> error codes, and caching strategy.

## Layout

- **Model & data** — `@automattic/api-core` → `read-spaces/`: `ReadSpace`,
  `ReadSpaceDetails`, `CreateReadSpaceParams`, `UpdateReadSpaceParams`,
  `MAX_SPACE_NAME_LENGTH`, the fetchers/mutators, and the wire→client mapping in
  `adapters.ts` (renames `follows` → `sources`). No JSX, no routes here — api-core
  stays serializable.
- **Queries & mutations** — `@automattic/api-queries` → `read-spaces.ts`:
  `readSpacesQuery`/`readSpaceQuery` and the create/update/delete/feed mutations.
  Each mutation returns the full detail and writes it back to the caches.
- **Consumer hooks** — `client/reader/data/spaces/`: `useSpaces`, `useSpace`,
  `useCreateSpace`, `useUpdateSpace`, `useDeleteSpace`. The Customize modal edits
  sources as local draft state and persists them via the `feeds` replace on
  `useUpdateSpace`, so there are no per-source consumer hooks (the underlying
  `addReadSpaceSource`/`deleteReadSpaceSource` endpoints stay in `api-core`).
- **UI (this folder)** — `view.tsx`, `controller.tsx`, `index.tsx` (routes),
  `icons.ts`, `colors.ts`/`colors.scss`, `routes.ts`, `form-helpers.ts`,
  `color-picker.tsx`, `icon-picker.tsx`, `create-modal/`, `customize-modal/`.
- **Sidebar entry point** — `client/reader/sidebar/spaces/`.

## Editing a space (RSM-4117)

`customize-modal/` is the **single upsert editor** for a space: a `TabPanel` with
**Identity** (name, tags, accent color, icon), **Layout** (the feed-layout
presets), **Sources** (the subscription add/remove list — migrated here from the
old standalone `sources-modal/`, which no longer exists), and **Delete** (edit
mode only, destructive _Delete space_ action that confirms via
`confirm-delete.tsx`). The **Customize** header button opens edit mode on
Identity. `create-modal/index.tsx` is a thin wrapper around the same upsert modal
in create mode; after create, the sidebar navigates to the new space route
without an action hash.

- **Save/Create batches the editable fields.** "Save changes" and "Create" send
  the same draft model: `name`, `tags`, `feeds`, and
  `layout: { color, icon, view }`. Source add/remove in the modal updates local
  draft state only; the endpoint receives the final `feeds` list on submit.
- **Draft state is seeded once** (a `isSeeded` flag), not on every `space` change,
  so a source add/remove (which rewrites the detail cache) can't clobber unsaved
  identity/layout edits.
- **Name validation excludes the current space** (`spaces.filter( id !== spaceId )`)
  so an unchanged name doesn't read as a duplicate.
- **Palette is client-owned.** `SpaceColor`/`SpaceIcon` are widened freely
  (server only sanitizes). The accent palette lives once in `colors.scss`
  (`$space-colors` + the `space-accent-color` mixin), consumed by both the sidebar
  item and `color-picker.tsx`; icon glyphs map through `SPACE_ICONS` in `icons.ts`.
  When adding a color/icon, update `colors.ts` (`SPACE_COLORS` + labels) /
  `icons.ts` and the `icon-picker.tsx` label map (typed `Record< SpaceIcon, … >`,
  so a missing label is a type error).
- **Not yet built (no backend):** description, AI tag auto-fill, text size, and
  column layout shown in the design mockups are intentionally omitted.

## Conventions

### File naming

- This folder is already `spaces/`, so **do not repeat `space`/`spaces` in file
  or folder names**: `view.tsx` (not `spaces-view.tsx`), `create-modal/` (not
  `create-space-modal/`), `menu-item.tsx` (not `space-menu-item.tsx`),
  `icons.ts`, `routes.ts`.
- Exported identifiers stay descriptive and qualified (`SpacesView`,
  `CreateSpaceModal`, `SPACE_ICONS`) — the redundancy rule is about file paths,
  not symbols.
- CSS class names keep a namespace prefix (`customize-space-modal__…`,
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
  `layout` (a `SpaceLayout`) so they can grow beyond color/icon; `layout.color`,
  `layout.iconColor` and `layout.icon` are **string keys**, never rendered
  glyphs. Map `layout.icon` → a `@wordpress/icons` element via `SPACE_ICONS` in
  `icons.ts`; the color keys select CSS variants.
- Color is split in two: `layout.color` is the **text accent** (post titles +
  actions) and can be `'none'` to keep the text neutral like the rest of the
  Reader; `layout.iconColor` colors the **icon** (sidebar chrome). Resolve the
  icon color with `resolveSpaceIconColor( layout )` in `colors.ts` — it falls
  back to `color` (then the default) so spaces created before the split keep a
  colored icon. The feed only emits the `space-feed--{color}` accent modifier
  when `color !== 'none'`.
- Build Spaces URLs with `routes.ts` (`SPACES_BASE_PATH`, `getSpacePath`) —
  never hand-concatenate paths.

### Form

- Create and edit share the upsert implementation in `customize-modal/index.tsx`;
  `create-modal/index.tsx` only adapts the existing public `CreateSpaceModal`
  export to create mode. Keep Identity/Layout/Sources behavior in the shared
  upsert modal so create and edit do not drift.
- Validation: name required, <= `MAX_SPACE_NAME_LENGTH`, and case-insensitive
  duplicate against the existing names (edit passes the list with the current
  space removed). The error message is rendered manually
  (`<p className="…__error">`).
- On create success: append to the cache (via the mutation), fire a
  `calypso_reader_*` Tracks event, show a `successNotice`, close, then the
  sidebar navigates to `getSpacePath( space.id )`.
- `TODO(RSM-4139)`: when the real backend lands, map its error kinds to copy
  where the generic `createSpace.isError` message is shown today.
- Forms use WordPress components and `useTranslate` from `i18n-calypso`.

### Data

- Follow the Reader three-layer pattern (see `../AGENTS.md`). Mutation factories
  in `@automattic/api-queries` take the consumer's `QueryClient`; the create
  mutation appends to `readSpacesQuery()` via `setQueryData`.
