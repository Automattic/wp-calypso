# Reader Shelves

Shelves group followed feeds (the client calls them `sources`) and tags under a
name. Dark-shipped behind the `reader/shelves` feature flag (epic RSM-4110), a8c
only, and wired to the real `wpcom/v2` backend.

> See [`README.md`](./README.md) for the full endpoint contract, data shapes,
> error codes, and caching strategy.

## Layout

- **Model & data** — `@automattic/api-core` → `read-shelves/`: `ReadShelf`,
  `ReadShelfDetails`, `CreateReadShelfParams`, `UpdateReadShelfParams`,
  `MAX_SHELF_NAME_LENGTH`, the fetchers/mutators, and the wire→client mapping in
  `adapters.ts` (renames `follows` → `sources`). No JSX, no routes here — api-core
  stays serializable.
- **Queries & mutations** — `@automattic/api-queries` → `read-shelves.ts`:
  `readShelvesQuery`/`readShelfQuery` and the create/update/delete/feed mutations.
  Each mutation returns the full detail and writes it back to the caches.
- **Consumer hooks** — `client/reader/data/shelves/`: `useShelves`, `useShelf`,
  `useCreateShelf`, `useUpdateShelf`, `useDeleteShelf`. The Customize modal edits
  sources as local draft state and persists them via the `feeds` replace on
  `useUpdateShelf`, so there are no per-source consumer hooks (the underlying
  `addReadShelfSource`/`deleteReadShelfSource` endpoints stay in `api-core`).
- **UI (this folder)** — `view.tsx`, `controller.tsx`, `index.tsx` (routes),
  `icons.ts`, `colors.ts`/`colors.scss`, `routes.ts`, `form-helpers.ts`,
  `color-picker.tsx`, `icon-picker.tsx`, `create-modal/`, `customize-modal/`.
- **Sidebar entry point** — `client/reader/sidebar/shelves/`.

## Editing a shelf (RSM-4117)

`customize-modal/` is the **single upsert editor** for a shelf. Edit mode uses a
`TabPanel` with **Identity** (name, accent color, icon), **Layout** (the
feed-layout presets), **Feeds** (the subscription add/remove list — internally
still keyed as `sources` because the API/client model maps wire `follows` to
`sources`), **Topics** (tags and languages), and **Delete** (edit mode only,
destructive _Delete shelf_ action that confirms via `confirm-delete.tsx`). The
**Customize** header button opens edit mode on Identity. `create-modal/index.tsx`
is a thin wrapper around the same upsert modal in create mode, rendered as a
step-by-step wizard over Identity → Layout → Feeds → Topics; after create, the
sidebar navigates to the new shelf route without an action hash.

- **Save/Create batches the editable fields.** "Save changes" and "Create" send
  the same draft model: `name`, `tags`, `feeds`, and
  `layout: { color, iconColor, icon, view, width }`. Source add/remove in the modal
  updates local draft state only; the endpoint receives the final `feeds` list on submit.
- **Draft state is seeded once** (a `isSeeded` flag), not on every `shelf` change,
  so a source add/remove (which rewrites the detail cache) can't clobber unsaved
  identity/layout edits.
- **Name validation excludes the current shelf** (`shelves.filter( id !== shelfId )`)
  so an unchanged name doesn't read as a duplicate.
- **Palette is client-owned.** `ShelfColor`/`ShelfIcon` are widened freely
  (server only sanitizes). The accent palette lives once in `colors.scss`
  (`$shelf-colors` + the `shelf-accent-color` mixin), consumed by both the sidebar
  item and `color-picker.tsx`; icon glyphs map through `SHELF_ICONS` in `icons.ts`.
  When adding a color/icon, update `colors.ts` (`SHELF_COLORS` + labels) /
  `icons.ts` and the `icon-picker.tsx` label map (typed `Record< ShelfIcon, … >`,
  so a missing label is a type error).
- **Column width** (`layout.width`, `'regular' | 'wide'`) is chosen in the Layout
  tab and consumed by `view.tsx` as `wideLayout={ width === 'wide' }` on
  `ReaderMain`. Unset falls back to `'wide'` (`DEFAULT_SHELF_WIDTH` in
  `customize-modal/layout-tab.tsx`) so existing shelves keep their current width;
  `wide` → `.main.is-wide-layout` (1040px), `regular` → the Reader default (768px).
- **Not yet built (no backend):** description, AI tag auto-fill, and text size
  shown in the design mockups are intentionally omitted.

## Conventions

### File naming

- This folder is already `shelves/`, so **do not repeat `shelf`/`shelves` in file
  or folder names**: `view.tsx` (not `shelves-view.tsx`), `create-modal/` (not
  `create-shelf-modal/`), `menu-item.tsx` (not `shelf-menu-item.tsx`),
  `icons.ts`, `routes.ts`.
- Exported identifiers stay descriptive and qualified (`ShelvesView`,
  `CreateShelfModal`, `SHELF_ICONS`) — the redundancy rule is about file paths,
  not symbols.
- CSS class names keep a namespace prefix (`customize-shelf-modal__…`,
  `sidebar-shelves__…`) because Calypso CSS is global; that prefix is not subject
  to the rule above.
- **Named exports only** — no `export default`. Two framework-mandated
  exceptions keep a default: the section entry `index.tsx` (the section loader
  calls `module.default`, see `client/sections-middleware.js`) and any module
  loaded via `AsyncLoad`, whose `require` must resolve to `{ default }` — map
  the named export in the loader instead (see `controller.tsx`:
  `import( './view' ).then( ( { ShelvesView } ) => ( { default: ShelvesView } ) )`).

### Model & presentation

- `ReadShelf` is serializable. Presentation settings live grouped under
  `layout` (a `ShelfLayout`) so they can grow beyond color/icon; `layout.color`,
  `layout.iconColor` and `layout.icon` are **string keys**, never rendered
  glyphs. Map `layout.icon` → a `@wordpress/icons` element via `SHELF_ICONS` in
  `icons.ts`; the color keys select CSS variants.
- Color is split in two: `layout.color` is the **text accent** (post titles +
  actions) and can be `'none'` to keep the text neutral like the rest of the
  Reader; `layout.iconColor` colors the **icon** (sidebar chrome). Resolve the
  icon color with `resolveShelfIconColor( layout )` in `colors.ts` — it falls
  back to `color` (then the default) so shelves created before the split keep a
  colored icon. The feed only emits the `shelf-feed--{color}` accent modifier
  when `color !== 'none'`.
- Build Shelves URLs with `routes.ts` (`SHELVES_BASE_PATH`, `getShelfPath`) —
  never hand-concatenate paths.

### Form

- Create and edit share the upsert implementation in `customize-modal/index.tsx`;
  `create-modal/index.tsx` only adapts the existing public `CreateShelfModal`
  export to create mode. Keep the Identity/Layout/Feeds/Topics draft behavior in
  the shared upsert modal so create and edit do not drift.
- Validation: name required, <= `MAX_SHELF_NAME_LENGTH`, and case-insensitive
  duplicate against the existing names (edit passes the list with the current
  shelf removed). The error message is rendered manually
  (`<p className="…__error">`).
- On create success: append to the cache (via the mutation), fire a
  `calypso_reader_*` Tracks event, show a `successNotice`, close, then the
  sidebar navigates to `getShelfPath( shelf.id )`.
- `TODO(RSM-4139)`: when the real backend lands, map its error kinds to copy
  where the generic `createShelf.isError` message is shown today.
- Forms use WordPress components and `useTranslate` from `i18n-calypso`.

### Data

- Follow the Reader three-layer pattern (see `../AGENTS.md`). Mutation factories
  in `@automattic/api-queries` take the consumer's `QueryClient`; the create
  mutation appends to `readShelvesQuery()` via `setQueryData`.
