# "Discover new blogs" — Reader Recent-feed module (READ-542)

A bounded, feature-flagged module in the Reader's **Recent** feed (`/read`)
that surfaces the per-user snapshot of out-of-network post recommendations
exported by READ-541.

## Status

Wired to `GET /wpcom/v2/reader/new-blogs` (wpcom: `rest-api-plugins/endpoints/reader-new-blogs.php`
over `lib/reader-oon-recs`), which reads the caller's row from `reader_oon_recs`,
applies the serve-time public/deleted guard and caps the list. The client side
is `@automattic/api-core` `fetchReadNewBlogs` + `@automattic/api-queries`
`readNewBlogsQuery`. Dismiss and Hide are still localStorage-only (layer 3).

## Feature flag

`reader/discover-new-blogs`

Off (`false`) in every environment. To try it, append
`?flags=reader/discover-new-blogs` to the URL (works locally and on calypso.live).

Mount point: `client/reader/following/main.tsx` calls `useNewBlogs()` and, when
the flag is on, the view is the "all subscriptions" Recent stream (no `feedId`),
the user has recs (none while loading or for cold-start) and has not hidden the
module, passes `<DiscoverNewBlogs />` to `<ReaderStream>` as `inStreamBlock` at
`inStreamBlockPosition` 2, i.e. the third spot after two recent posts.

Placement note: the PRD said "never in the chronological follow feed", but the
READ-542 thread (rob.pugh, Dave Martin, 2026-09-03) moved it to Recent so the
A/B isn't measuring one recommendation design against another on Discover.

## Behaviour (from the READ-542 answers + project design)

- Heading "Discover new blogs" with a **Hide** link that hides the module
  (persisted locally under `reader-new-blogs-hidden-v1`).
- Fixed **3** cards, no selector. **More like this** pages to the next 3 recs and
  disappears when the snapshot is exhausted. Each card: site icon + name, **Subscribe**
  (`ReaderFollowButton`, follow source `reader-discover-new-blogs`), an **X**,
  post title (opens the Reader full-post view) and a two-line excerpt.
- The X means "not interested": the card disappears immediately, every rec from
  that blog is filtered out (persisted under `reader-new-blogs-dismissed-v1`),
  and the Reader's existing recommended-site dismiss
  mutation is called so the blog stays out of recommendations, the same thing
  the sidebar's Recommended sites card does.

## Testing states

The module reads the real endpoint, so states follow your user's row in
`reader_oon_recs` (no row or empty `recs` = cold-start, nothing renders).
Dismissed blogs and the hidden flag persist to `localStorage` under
`reader-new-blogs-dismissed-v1` and `reader-new-blogs-hidden-v1`; clear them to reset.

## Data shape

`ReadNewBlogsRec` = `{ blogId, postId, score }` — the endpoint's `{ blog_id, post_id, score }`
mapped to camelCase by api-core (from the warehouse table: `source_id`→`blogId`,
`item_id`→`postId`, `recommendation_score`→`score`, `rec_rank`→array order).

Each `(blogId, postId)` is hydrated through the Reader post store (`usePost`)
and rendered by the module's own card (`card.tsx`). An error post (deleted /
private / 404) renders nothing, which doubles as the client half of the
serve-time guard.

## TrainTracks (READ-543)

The endpoint doesn't send railcars, so `useNewBlogs` mints one per rec per snapshot
(`buildRailcar`: `{ railcar, fetch_algo: 'cluster_rec_v0', fetch_position, rec_blog_id,
rec_post_id }`, `fetch_position` = 1-based snapshot rank) and every event for a card shares it.
The module renders `NewBlogRec` = `ReadNewBlogsRec` + `railcar`.

| event                          | when                                | `action`                                                               |
| ------------------------------ | ----------------------------------- | ---------------------------------------------------------------------- |
| `calypso_traintracks_render`   | card 60% visible, once per railcar  | — (`ui_algo` `reader_recent_discover_new_blogs`, `ui_position` = slot) |
| `calypso_traintracks_interact` | title click                         | `recommended_post_clicked`                                             |
|                                | Subscribe / Unsubscribe             | `recommended_site_subscribed` / `recommended_site_unsubscribed`        |
|                                | X                                   | `recommended_site_dismissed`                                           |
|                                | More like this (per card on screen) | `recommended_more_clicked`                                             |
|                                | Hide (per card on screen)           | `recommended_module_hidden`                                            |

The `calypso_reader_discover_new_blogs_*` Tracks events from READ-542 fire alongside.
`_render` fires on the first card impression (not on mount), so it counts the same
thing as the TrainTracks renders. Helpers live in `tracks.ts`.

## Wiring left to do

1. Persist dismiss and Hide server-side instead of `localStorage` (READ-542 layer 3).
2. ExPlat assignment for the A/B (READ-543) — needs the experiment name.
