# Reader Spaces — expected endpoints

Spaces are dark-shipped behind the `reader/spaces` flag (epic RSM-4110). The
**list, create, and delete** endpoints are now live on `wpcom/v2`; the
**single-space (detail) and source** endpoints are still hard-coded placeholders
that mutate the React Query cache in-memory. This document lists every endpoint
the client expects and the contract each honors.

> Endpoints are marked **live** or **proposed** below. Live paths are pinned to
> the real `wpcom/v2` routes; proposed paths are the shapes the client expects
> and are not yet pinned.

## Data shapes

These types live in `@automattic/api-core` → `read-spaces/types.ts`. The wire
JSON is snake_case (`title`, `layout_color`, `layout_icon`, numeric `id`); the
fetchers adapt it to these shapes in `read-spaces/adapters.ts` (as `read-follows`
does for subscriptions).

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

### 1. List spaces — `GET /reader/spaces` · RSM-4145 · **live**

Returns the user's spaces **without** their sources.

- **Request:** none (authenticated user).
- **Response `200`:** array of wire items (snake_case), adapted to `ReadSpace[]`.
- Wired: `fetchReadSpaces()` → real `GET`, mapped via `adaptReadSpace`.

### 2. Get one space — `GET /reader/spaces/{id}` · RSM-4145 · **proposed**

Returns a single space **with** its sources. This is the only endpoint that
returns `sources`.

- **Request:** path param `id`.
- **Response `200`:** `ReadSpaceDetails`
- **Response `404`:** unknown id.
- Placeholder: `fetchReadSpace(id)` still resolves the in-memory set + `sources: []`.

### 3. Create space — `POST /reader/spaces/new` · RSM-4139 · **live**

- **Request body:** `{ title, tags }` (the create form sends only these; the
  endpoint also accepts optional `sites`, `layout_color`, `layout_icon`).
- **Response `201`:** the created space (snake_case wire item), adapted to
  `ReadSpaceDetails`. Server defaults a random palette `layout_color`/`layout_icon`
  when omitted, and `sources: []`.
- **Errors:** `403 rest_forbidden`, `400 reader_spaces_invalid_title`,
  `400 reader_spaces_invalid_tag`, `409 reader_spaces_duplicate_slug`.
- Wired: `createReadSpace()` → real `POST`, mapped via `adaptReadSpaceDetails`.

> The create flow is **not** optimistic — the cache is written in `onSuccess`
> using the returned space, so the list always carries the backend id (no temp-id
> reconciliation). On success the list gets a `ReadSpace` (sources stripped) and
> the detail cache is seeded with the full `ReadSpaceDetails`.

### 4. Add a source to a space — `POST /reader/spaces/{id}/sources` · ticket TBD · **proposed**

- **Request body:** a source identifier — at least one of
  `{ feed_id?: number; blog_id?: number; feed_url?: string }`.
- **Response `200`/`201`:** the created `SpaceSource` (lets the optimistic patch
  reconcile), or `204`.
- Placeholder: `addReadSpaceSource()` is a no-op; the cache patch is optimistic.

### 5. Remove a source from a space — `DELETE /reader/spaces/{id}/sources/{sourceId}` · ticket TBD · **proposed**

- **Request:** identify the source by `feed_id`/`blog_id`/`feed_url` (path or query).
- **Response `200`/`204`.**
- Placeholder: `deleteReadSpaceSource()` is a no-op; the cache patch is optimistic.

### 6. Delete a space — `POST /reader/spaces/{id}/delete` · RSM-4110 · **live**

Permanently deletes a space (hard delete — no trash/undo). Owner-only, enforced
server-side.

- **Request:** path param `id`, no body.
- **Response `200`:** `{ deleted: true, id }`.
- **Response `403`:** `rest_forbidden` — logged out / not an Automattician.
- **Response `404`:** `reader_spaces_not_found` — gone **or** not yours
  (intentionally indistinguishable; we don't reveal other users' spaces, so the
  UI must treat both the same).
- **Response `500`:** `reader_spaces_delete_failed` — yours, but deletion failed.
- Wired: `deleteReadSpace( id )` → real `POST`; `deleteReadSpaceMutation` removes
  the space from the list cache and discards its detail cache `onSuccess`. No UI
  consumer yet — `useDeleteSpace()` is ready for a (confirm-gated) delete control.

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
