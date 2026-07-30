# Reader Shelves — API contract

A Shelf groups followed feeds (the client calls them `sources`) and followed tags
under a name. Dark-shipped behind the `reader/shelves` flag (epic RSM-4110), a8c
only. All endpoints live under `wpcom/v2` and are wired to the real backend.

> Ownership: you only ever see or modify your own shelves. Another user's shelf
> (or a non-existent id) returns `404 reader_shelves_not_found` — the two are
> indistinguishable by design, so the UI must treat them the same. `403` is
> purely the a8c gate.

## Data shapes

These types live in `@automattic/api-core` → `read-shelves/types.ts`. The wire JSON
uses `title` (not `name`), a numeric `id`, a `layout` object (`{ color, icon }`),
and `follows`; `read-shelves/adapters.ts` maps it to the client shapes below (as
`read-follows` does for subscriptions) — chiefly renaming `title` to `name` and
the wire `follows` to `sources`.

```ts
// Summary — returned by the list endpoint only. No sources, no tags.
interface ReadShelf {
	id: string;
	name: string; // wire `title`
	layout: ShelfLayout;
}

// Presentation settings, grouped so they can grow beyond color/icon. The palette
// is client-owned (the server only sanitizes), so these unions are widened freely;
// the picker constrains the choices. See `colors.ts`/`colors.scss` and `icons.ts`.
interface ShelfLayout {
	color: ShelfColor; // 'blue'|'purple'|'red'|'orange'|'gray'|'green'|'celadon'|'pink'
	icon: ShelfIcon; // 'inbox'|'box'|'video'|'comment'|'cart'|'star'|'pages'|'category'|'globe'|'tag'|'rss'|'people'|'home'|'gallery'|'chart'|'palette'
}

// Detail — summary + followed feeds + tags. Returned by every endpoint but list.
interface ReadShelfDetails extends ReadShelf {
	sources: ShelfSource[]; // wire `follows`
	tags: string[]; // tag slugs
}

// A followed feed (wire `follows[]`).
interface ShelfSource {
	feedId: number; // numeric feedbag id; used to remove the feed
	feedUrl: string;
	blogId: number | null; // null for external (non-WP/Jetpack) feeds
	name: string | null;
	siteIcon: string | null; // wire `icon`
}
```

The layout palette is **not** validated server-side (only sanitized) and is
random-until-set, so the client constrains the picker and should write a value
early if it shouldn't drift between fetches.

## Endpoints

All paths are under `https://public-api.wordpress.com/wpcom/v2/reader/shelves`.
Every mutation returns the **full updated detail**, so the client writes that
straight to the caches for an immediate UI update, then invalidates the affected
queries for a canonical refresh.

| #   | Method & path                                 | Body                                                                   | Returns               | Wired as                     |
| --- | --------------------------------------------- | ---------------------------------------------------------------------- | --------------------- | ---------------------------- |
| 1   | `GET /reader/shelves`                         | —                                                                      | `200` summary[]       | `fetchReadShelves()`         |
| 2   | `GET /reader/shelves/{id}`                    | —                                                                      | `200` detail          | `fetchReadShelf(id)`         |
| 3   | `GET /reader/shelves/slug/{slug}`             | —                                                                      | `200` detail          | `fetchReadShelfBySlug(slug)` |
| 4   | `POST /reader/shelves`                        | `{ title*, feeds?, tags?, layout? }`                                   | `201` detail          | `createReadShelf()`          |
| 5   | `PUT /reader/shelves/{id}`                    | `{ title?, feeds?, tags?, layout? }` (≥1; `layout` is a partial merge) | `200` detail          | `updateReadShelf()`          |
| 6   | `DELETE /reader/shelves/{id}`                 | —                                                                      | `200 { deleted, id }` | `deleteReadShelf()`          |
| 7   | `POST /reader/shelves/{id}/feeds`             | `{ feed* }` (feed id or url)                                           | `200` detail          | `addReadShelfSource()`       |
| 8   | `DELETE /reader/shelves/{id}/feeds/{feed_id}` | —                                                                      | `200` detail          | `deleteReadShelfSource()`    |
| 9   | `GET /reader/shelves/{id}/posts`              | query: `count?` (≤15), `tag_limit?`, `page_handle?`                    | `200` stream          | `shelf:{id}` stream          |
| 10  | `GET /reader/shelves/{id}/discover`           | query: `count?` (≤7), `page_handle?`                                   | `200` stream          | `shelf_discover:{id}` stream |

Notes:

- **Feeds** must already exist (a feed id or url the backend can resolve); the
  client only offers feeds the user already follows. Create/update send the
  complete desired feed set as `feeds`; the per-feed endpoints remain available
  for consumers that need immediate add/remove behavior.
- **Tags** are a full replace via `update` (endpoint 4) — there are no per-tag
  endpoints. Pass the complete desired set; `[]` clears them.
- **Create** sends `title`, selected `feeds`, `tags`, and the persisted layout
  fields (`color`/`icon`/`view`) from the shared upsert modal.
- **Delete** is a permanent hard delete (no trash/undo) — the upsert modal gates
  it behind a confirm dialog (`customize-modal/confirm-delete.tsx`) in edit mode.
  `useCreateShelf()`, `useUpdateShelf()` (Save), and `useDeleteShelf()` (Delete
  shelf) are all consumed by `customize-modal/`.
- **Feed** (endpoint 8) returns the standard Reader stream shape
  (`{ cards, next_page_handle }`), built server-side from the shelf's followed
  feeds and tags. It is wired as a normal Reader stream keyed `shelf:{id}` (see
  `read-streams` `fetchReadShelfPosts` and the `shelf` case in
  `build-query-params`), so `client/reader/shelves/feed/` consumes it through
  `useInfiniteStream` like every other stream. `count` is capped at 15
  server-side; paginate via the returned `page_handle`. Followed tags are
  merged in, capped per page at `tag_limit` (server default 3, `0` = feeds
  only); the rest of each page is followed-feed posts. The client does not
  send `tag_limit` today, so the server default applies.
- **Discover** (endpoint 9) is the same stream shape and consumer as the Feed —
  the Discover tab renders the same `client/reader/shelves/feed/` shell with
  `variant="discover"`, keyed `shelf_discover:{id}` (see `fetchReadShelfDiscover`
  and the `shelf_discover` case in `build-query-params`). The backend recommends
  new on-topic posts the user does **not** already follow (from the shelf's
  discovery strands, falling back to the viewer's global Reader topics). `count`
  is capped at **7** (a tighter Elasticsearch limit than the posts feed); no
  `tag_limit`. Paginate via the returned `page_handle`.

## Error codes

| HTTP | code                            | when                                   |
| ---- | ------------------------------- | -------------------------------------- |
| 403  | `rest_forbidden`                | not logged in / not an Automattician   |
| 404  | `reader_shelves_not_found`      | shelf doesn't exist or isn't yours     |
| 404  | `reader_shelves_item_not_found` | removing a feed not in the shelf       |
| 400  | `reader_shelves_invalid_title`  | empty title (create or update)         |
| 400  | `reader_shelves_invalid_feed`   | a feed isn't an existing feedbag feed  |
| 400  | `reader_shelves_invalid_tag`    | a tag slug isn't a valid Reader tag    |
| 400  | `reader_shelves_no_changes`     | `update` with no recognized fields     |
| 409  | `reader_shelves_duplicate_slug` | a shelf with that title already exists |
| 409  | `reader_shelves_duplicate_feed` | feed already in the shelf              |
| 500  | `reader_shelves_delete_failed`  | delete didn't persist (rare)           |

The create modal maps `rest_forbidden` / `reader_shelves_invalid_title` /
`reader_shelves_invalid_tag` / `reader_shelves_duplicate_slug` to copy; other
surfaces should map the relevant codes as they adopt the mutations.

## Caching

Both `readShelvesQuery` and `readShelfQuery` use `staleTime: Infinity`,
`refetchOnMount: 'always'`, and `meta: { persist: true }`. The persisted cache
lets the sidebar and shelf views render immediately after reload, while
mount-time refetch refreshes the canonical server state in the background. The
list query (`readShelvesQuery`) also sets `placeholderData: keepPreviousData`
because its key is stable; the detail query (`readShelfQuery`) deliberately omits
it so a `shelfId` change never flashes the previous shelf's name/sources. Every
mutation returns the full detail
and writes it back (the detail cache gets the returned shelf; the list gets its
summary), then invalidates the affected queries so active consumers refetch and
inactive consumers refresh the next time they mount.

The Sources tab (`customize-modal/sources-tab.tsx`) only mounts while it is the
active `TabPanel` tab, so its `useSiteSubscriptions` query (which paginates all
pages) doesn't run until the user opens Sources. Source choices in create and
edit are held in local draft state and sent as the final `feeds` list when the
user submits the upsert modal. The modal reads the shelf detail via
`useShelfBySlug` — the same by-slug query the view already resolved — so it's a
cache hit by the time the edit modal opens (no id-keyed refetch).

## Related

- Data & UI conventions: [`./AGENTS.md`](./AGENTS.md)
- Reader data layer (three-layer pattern): [`../AGENTS.md`](../AGENTS.md)
- Model: `@automattic/api-core` → `read-shelves/`
- Queries & mutations: `@automattic/api-queries` → `read-shelves.ts`
- Consumer hooks: `client/reader/data/shelves/`
