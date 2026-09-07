# "Discover new blogs" — Reader Recent-feed module (READ-542)

A bounded, feature-flagged module in the Reader's **Recent** feed (`/read`)
that surfaces the per-user snapshot of out-of-network post recommendations
exported by READ-541.

## Status

**Front-end, mock-only.** The backend endpoint
(`GET /wpcom/v2/reader/discover/blogs-you-dont-follow`, READ-542 layer 4) does
not exist yet, so `use-oon-recs.ts` reads `mock-data.ts`. Everything else — the
flag, the layout, cold-start handling, per-item dismiss, Tracks events — is real.

## Feature flag

`reader/discover-new-blogs`

| env                                   | value   |
| ------------------------------------- | ------- |
| development (`yarn start`, localhost) | `true`  |
| wpcalypso, horizon, stage, production | `false` |

Mount point: `client/reader/following/main.tsx` calls `useOonRecs()` and, when
the flag is on, the view is the "all subscriptions" Recent stream (no `feedId`),
the user has recs and has not hidden the module, passes `<DiscoverNewBlogs />`
to `<ReaderStream>` as `inStreamBlock` at `inStreamBlockPosition` 2, i.e. the
third spot after two recent posts.

Placement note: the PRD said "never in the chronological follow feed", but the
READ-542 thread (rob.pugh, Dave Martin, 2026-09-03) moved it to Recent so the
A/B isn't measuring one recommendation design against another on Discover.

## Behaviour (from the READ-542 answers + project design)

- Heading "Discover new blogs" with a **Hide** link that hides the module
  (persisted locally under `reader-oon-hidden-v1`).
- Fixed **3** cards, no selector. **More like this** pages to the next 3 recs and
  disappears when the snapshot is exhausted. Each card: site icon + name, **Subscribe**
  (`ReaderFollowButton`, follow source `reader-discover-new-blogs`), an **X**,
  post title (opens the Reader full-post view) and a two-line excerpt.
- The X means "not interested": the card disappears immediately, every rec from
  that blog is filtered out (persisted under `reader-oon-dismissed-blogs-v1`),
  and — once `USE_MOCK` is off — the Reader's existing recommended-site dismiss
  mutation is called so the blog stays out of recommendations, the same thing
  the sidebar's Recommended sites card does. In mock mode the server call is
  skipped so demo clicks don't permanently dismiss real blogs.

## Demoing the states (no code edits)

Append to the Recent URL (`/read`):

| query                | result                                                    |
| -------------------- | --------------------------------------------------------- |
| `?oon_mock=23314024` | the healthy 8-rec list, one post per blog                 |
| `?oon_mock=111`      | short list, 3 recs                                        |
| `?oon_mock=222`      | one deleted post id — that card is dropped by the guard   |
| `?oon_mock=cold`     | cold-start — module renders nothing                       |
| _(none)_             | current user's list if present, else the demo user's list |

Dismissed blogs and the hidden flag persist to `localStorage` (keys above).
Clear them to reset.

## Data shape

`OonRec` = `{ blogId, postId, score }` — exactly what the real endpoint will
return (mapped from the warehouse table: `source_id`→`blogId`,
`item_id`→`postId`, `recommendation_score`→`score`, `rec_rank`→array order).

There are no mock display fields. Each `(blogId, postId)` is hydrated through
the Reader post store (`usePost`) and rendered with the stream's compact
`ReaderPostCard` (via `calypso/reader/stream/post`), so the module looks exactly
like the Discover feed around it. The mock therefore points at real, public
WordPress.com posts. An error post (deleted / private / 404) renders nothing,
which doubles as the client half of the serve-time guard.

## TrainTracks (READ-543)

Every rec carries a railcar (`{ railcar, fetch_algo: 'cluster_rec_v0', fetch_position,
rec_blog_id, rec_post_id }`). The endpoint should mint these; until it exists the hook
mints one per rec per snapshot (`buildRailcar`) so all events for a card share an id.

| event                          | when                                | `action`                                                               |
| ------------------------------ | ----------------------------------- | ---------------------------------------------------------------------- |
| `calypso_traintracks_render`   | card 60% visible, once per railcar  | — (`ui_algo` `reader_recent_discover_new_blogs`, `ui_position` = slot) |
| `calypso_traintracks_interact` | title click                         | `recommended_post_clicked`                                             |
|                                | Subscribe / Unsubscribe             | `recommended_site_subscribed` / `recommended_site_unsubscribed`        |
|                                | X                                   | `recommended_site_dismissed`                                           |
|                                | More like this (per card on screen) | `recommended_more_clicked`                                             |
|                                | Hide (per card on screen)           | `recommended_module_hidden`                                            |

The `calypso_reader_discover_new_blogs_*` Tracks events from READ-542 fire alongside.
`_render` now fires on the first card impression (not on mount), so it counts the same
thing as the TrainTracks renders. Helpers live in `tracks.ts`.

## Files

| file                  | role                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `index.tsx`           | module component — heading, Hide, fixed 3 cards, Tracks events                                 |
| `use-oon-recs.ts`     | data hook — recs, dismissBlog (local + recommended-site dismiss), hide; mock behind `USE_MOCK` |
| `mock-data.ts`        | fixtures keyed by user id; mirrors `wp-content/lib/reader-oon-recs/fixtures/oon-recs.json`     |
| `placeholder.tsx`     | card-shaped loading state so the block keeps its height while posts hydrate                    |
| `tracks.ts`           | TrainTracks helpers: railcar minting, render + interact (READ-543)                             |
| `card.tsx`            | `usePost` hydration + site icon/name, Subscribe, X, title, excerpt (per the design)            |
| `types.ts`            | `OonRec` / `OonRecsSnapshot` — the endpoint shape                                              |
| `style.scss`          | module + card styles                                                                           |
| `test/index.test.tsx` | render tests: empty, cards, fixed cap of 3, dismiss and hide wiring                            |

## Wiring left to do

1. Flip `USE_MOCK` to `false` and point the hook at the endpoint once it ships.
2. Send dismiss to the server (`POST …/blogs-you-dont-follow/dismiss`) instead of
   `localStorage` (READ-542 layer 3).
3. ExPlat assignment for the A/B (READ-543) — needs the experiment name.
