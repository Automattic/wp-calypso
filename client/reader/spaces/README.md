# Reader Spaces — API contract

A Space groups followed feeds (the client calls them `sources`) and followed tags
under a name. Dark-shipped behind the `reader/spaces` flag (epic RSM-4110), a8c
only. All endpoints live under `wpcom/v2` and are wired to the real backend.

> Ownership: you only ever see or modify your own spaces. Another user's space
> (or a non-existent id) returns `404 reader_spaces_not_found` — the two are
> indistinguishable by design, so the UI must treat them the same. `403` is
> purely the a8c gate.

## Data shapes

These types live in `@automattic/api-core` → `read-spaces/types.ts`. The wire JSON
uses `title` (not `name`), a numeric `id`, a `layout` object (`{ color, icon }`),
and `follows`; `read-spaces/adapters.ts` maps it to the client shapes below (as
`read-follows` does for subscriptions) — chiefly renaming `title` to `name` and
the wire `follows` to `sources`.

```ts
// Summary — returned by the list endpoint only. No sources, no tags.
interface ReadSpace {
	id: string;
	name: string; // wire `title`
	layout: SpaceLayout;
}

// Presentation settings, grouped so they can grow beyond color/icon. The palette
// is client-owned (the server only sanitizes), so these unions are widened freely;
// the picker constrains the choices. See `colors.ts`/`colors.scss` and `icons.ts`.
interface SpaceLayout {
	color: SpaceColor; // 'blue'|'purple'|'red'|'orange'|'gray'|'green'|'celadon'|'pink'
	icon: SpaceIcon; // 'inbox'|'box'|'video'|'comment'|'cart'|'star'|'pages'|'category'|'globe'|'tag'|'rss'|'people'|'home'|'gallery'|'chart'|'palette'
}

// Detail — summary + followed feeds + tags. Returned by every endpoint but list.
interface ReadSpaceDetails extends ReadSpace {
	sources: SpaceSource[]; // wire `follows`
	tags: string[]; // tag slugs
}

// A followed feed (wire `follows[]`).
interface SpaceSource {
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

All paths are under `https://public-api.wordpress.com/wpcom/v2/reader/spaces`.
Every mutation returns the **full updated detail**, so the client writes that
straight to the caches — no follow-up GET.

| #   | Method & path                                | Body                                                                   | Returns               | Wired as                  |
| --- | -------------------------------------------- | ---------------------------------------------------------------------- | --------------------- | ------------------------- |
| 1   | `GET /reader/spaces`                         | —                                                                      | `200` summary[]       | `fetchReadSpaces()`       |
| 2   | `GET /reader/spaces/{id}`                    | —                                                                      | `200` detail          | `fetchReadSpace(id)`      |
| 3   | `POST /reader/spaces`                        | `{ title*, feeds?, tags?, layout? }`                                   | `201` detail          | `createReadSpace()`       |
| 4   | `PUT /reader/spaces/{id}`                    | `{ title?, feeds?, tags?, layout? }` (≥1; `layout` is a partial merge) | `200` detail          | `updateReadSpace()`       |
| 5   | `DELETE /reader/spaces/{id}`                 | —                                                                      | `200 { deleted, id }` | `deleteReadSpace()`       |
| 6   | `POST /reader/spaces/{id}/feeds`             | `{ feed* }` (feed id or url)                                           | `200` detail          | `addReadSpaceSource()`    |
| 7   | `DELETE /reader/spaces/{id}/feeds/{feed_id}` | —                                                                      | `200` detail          | `deleteReadSpaceSource()` |
| 8   | `GET /reader/spaces/{id}/posts`              | query: `count?` (≤15), `tag_limit?`, `page_handle?`                    | `200` stream          | `space:{id}` stream       |

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
  `useCreateSpace()`, `useUpdateSpace()` (Save), and `useDeleteSpace()` (Delete
  space) are all consumed by `customize-modal/`.
- **Feed** (endpoint 8) returns the standard Reader stream shape
  (`{ cards, next_page_handle }`), built server-side from the space's followed
  feeds and tags. It is wired as a normal Reader stream keyed `space:{id}` (see
  `read-streams` `fetchReadSpacePosts` and the `space` case in
  `build-query-params`), so `client/reader/spaces/feed/` consumes it through
  `useInfiniteStream` like every other stream. `count` is capped at 15
  server-side; paginate via the returned `page_handle`. Followed tags are
  merged in, capped per page at `tag_limit` (server default 3, `0` = feeds
  only); the rest of each page is followed-feed posts. The client does not
  send `tag_limit` today, so the server default applies.

## Error codes

| HTTP | code                           | when                                   |
| ---- | ------------------------------ | -------------------------------------- |
| 403  | `rest_forbidden`               | not logged in / not an Automattician   |
| 404  | `reader_spaces_not_found`      | space doesn't exist or isn't yours     |
| 404  | `reader_spaces_item_not_found` | removing a feed not in the space       |
| 400  | `reader_spaces_invalid_title`  | empty title (create or update)         |
| 400  | `reader_spaces_invalid_feed`   | a feed isn't an existing feedbag feed  |
| 400  | `reader_spaces_invalid_tag`    | a tag slug isn't a valid Reader tag    |
| 400  | `reader_spaces_no_changes`     | `update` with no recognized fields     |
| 409  | `reader_spaces_duplicate_slug` | a space with that title already exists |
| 409  | `reader_spaces_duplicate_feed` | feed already in the space              |
| 500  | `reader_spaces_delete_failed`  | delete didn't persist (rare)           |

The create modal maps `rest_forbidden` / `reader_spaces_invalid_title` /
`reader_spaces_invalid_tag` / `reader_spaces_duplicate_slug` to copy; other
surfaces should map the relevant codes as they adopt the mutations.

## Caching

Both `readSpacesQuery` and `readSpaceQuery` use `staleTime: Infinity` +
`meta: { persist: false }`. Every mutation returns the full detail and writes it
back (the detail cache gets the returned space; the list gets its summary), so
the caches stay authoritative without refetch churn — `staleTime: Infinity` only
suppresses refetching already-cached data, so a space's detail still loads the
first time its modal opens. `persist: false` keeps the layout (random-until-set)
out of the persisted cache, so a reload refetches fresh rather than rehydrating
stale colours.

The Sources tab (`customize-modal/sources-tab.tsx`) only mounts while it is the
active `TabPanel` tab, so its `useSiteSubscriptions` query (which paginates all
pages) doesn't run until the user opens Sources. Source choices in create and
edit are held in local draft state and sent as the final `feeds` list when the
user submits the upsert modal. The modal reads
the space detail via `useSpace`, which is already cached by the time the edit
modal opens.

## Related

- Data & UI conventions: [`./AGENTS.md`](./AGENTS.md)
- Reader data layer (three-layer pattern): [`../AGENTS.md`](../AGENTS.md)
- Model: `@automattic/api-core` → `read-spaces/`
- Queries & mutations: `@automattic/api-queries` → `read-spaces.ts`
- Consumer hooks: `client/reader/data/spaces/`
