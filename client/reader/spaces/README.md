# Reader Spaces — expected endpoints

Spaces are dark-shipped behind the `reader/spaces` flag and have **no backend
yet** (epic RSM-4110). Today the data layer resolves a hard-coded placeholder
set and mutates the React Query cache in-memory. This document lists the
endpoints the client already expects, and the contract each one needs to honor
so the placeholders can be swapped for real requests with no changes above the
`@automattic/api-core` layer.

> No endpoints are implemented yet — every REST path below is **proposed**. The
> request/response shapes are defined by the client; the paths are not pinned.

## Data shapes

These types live in `@automattic/api-core` → `read-spaces/types.ts`. The wire
JSON will likely be snake_case; if so, the fetchers adapt it to these shapes
(as `read-follows` already does for subscriptions).

```ts
// List shape — NO sources. Returned by the list endpoint.
interface ReadSpace {
	id: string;
	name: string;
	tags: string[];
	layout: SpaceLayout;
}

// Presentation settings, grouped so they can grow beyond color/icon.
interface SpaceLayout {
	color: SpaceColor; // 'blue'|'purple'|'red'|'orange'|'gray'|'green'|'celadon'
	icon: SpaceIcon; // 'inbox'|'box'|'video'|'comment'|'cart'|'star'|'pages'|'category'
}

// Detail shape — list fields + sources. Returned ONLY by the single-space endpoint.
interface ReadSpaceDetails extends ReadSpace {
	sources: SpaceSource[];
}

interface SpaceSource {
	feedId?: number | string | null;
	blogId?: number | string | null;
	feedUrl: string;
	siteUrl: string;
	name: string;
	siteIcon?: string | null;
}

interface CreateReadSpaceParams {
	name: string; // required, <= MAX_SPACE_NAME_LENGTH (50)
	tags: string[];
}
```

`color`/`icon` are serializable string keys (mapped to glyphs/CSS in the UI),
never rendered elements. `MAX_SPACE_NAME_LENGTH` (50) is enforced client-side
and must stay in sync with the backend (RSM-4139).

## Endpoints

### 1. List spaces — `GET /read/spaces` · RSM-4145

Returns the user's spaces **without** their sources.

- **Request:** none (authenticated user).
- **Response `200`:** `ReadSpace[]`
- Placeholder: `fetchReadSpaces()` → in-memory set, stripped of sources.

### 2. Get one space — `GET /read/spaces/{id}` · RSM-4145

Returns a single space **with** its sources. This is the only endpoint that
returns `sources`.

- **Request:** path param `id`.
- **Response `200`:** `ReadSpaceDetails`
- **Response `404`:** unknown id.
- Placeholder: `fetchReadSpace(id)` → matching placeholder space + `sources: []`.

### 3. Create space — `POST /read/spaces` · RSM-4139

- **Request body:** `CreateReadSpaceParams` → `{ name, tags }`
- **Response `201`:** `ReadSpaceDetails` (server-generated `id`, defaults applied:
  `layout: { color: 'blue', icon: 'category' }`, `sources: []`).
- **Response `422`:** empty name / name over `MAX_SPACE_NAME_LENGTH`.
- Placeholder: `createReadSpace()` builds the space locally with a generated id.

> The create flow is **not** optimistic — the cache is written in `onSuccess`
> using the returned space, so the list always carries the backend id (no temp-id
> reconciliation). On success the list gets a `ReadSpace` (sources stripped) and
> the detail cache is seeded with the full `ReadSpaceDetails`.

### 4. Add a source to a space — `POST /read/spaces/{id}/sources` · ticket TBD

- **Request body:** a source identifier — at least one of
  `{ feed_id?: number; blog_id?: number; feed_url?: string }`.
- **Response `200`/`201`:** the created `SpaceSource` (lets the optimistic patch
  reconcile), or `204`.
- Placeholder: `addReadSpaceSource()` is a no-op; the cache patch is optimistic.

### 5. Remove a source from a space — `DELETE /read/spaces/{id}/sources/{sourceId}` · ticket TBD

- **Request:** identify the source by `feed_id`/`blog_id`/`feed_url` (path or query).
- **Response `200`/`204`.**
- Placeholder: `deleteReadSpaceSource()` is a no-op; the cache patch is optimistic.

## Caching strategy (placeholder vs real)

While the endpoints are placeholders, both `readSpacesQuery` and
`readSpaceQuery` use `staleTime: Infinity` + `meta: { persist: false }`:
mutations write the cache directly and we never refetch (a placeholder fetch
would clobber created spaces). `persist: false` keeps the in-memory data out of
the persisted cache, so **a full page reload already refetches a fresh list** —
session-only writes don't leak across reloads.

The sources modal stays mounted with `isOpen` toggling, so its queries — the
space detail (`useSpace`) and site subscriptions (`useSiteSubscriptions`, which
paginates all pages) — are gated on `isOpen` (`enabled: isOpen`) and only fetch
while the modal is shown.

When the real endpoints land:

- Replace the manual `setQueryData` in the create / source mutations with
  `queryClient.invalidateQueries( readSpacesQuery() )` (and the detail query) to
  reconcile with canonical server state immediately, not just on reload.
- Drop `staleTime: Infinity` and `meta: { persist: false }`.
- Add `onMutate` + rollback hardening per the
  [`client/reader/AGENTS.md`](../AGENTS.md) optimistic-mutation checklist
  (`cancelQueries` in try/catch, `encodeURIComponent` on the path `id`).

## Open questions for the backend

- REST paths for every endpoint — none are implemented yet; the paths above are
  proposed.
- Source identifier shape for add/remove (numeric id vs object; what the add
  endpoint returns).
- Wire casing (snake_case vs camelCase) — decides whether the fetchers need an
  adapter.
- Tickets for source management (endpoints 4 & 5) — not yet filed.

## Related

- Data & UI conventions: [`./AGENTS.md`](./AGENTS.md)
- Reader data layer (three-layer pattern, optimistic hardening): [`../AGENTS.md`](../AGENTS.md)
- Model: `@automattic/api-core` → `read-spaces/`
- Queries & mutations: `@automattic/api-queries` → `read-spaces.ts`
- Consumer hooks: `client/reader/data/spaces/`
