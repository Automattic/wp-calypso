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

| env                                   | value   |
| ------------------------------------- | ------- |
| development (`yarn start`, localhost) | `true`  |
| wpcalypso, horizon, stage, production | `false` |

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

## Wiring left to do

1. Persist dismiss and Hide server-side instead of `localStorage` (READ-542 layer 3).
2. A/B assignment + fuller Tracks per READ-543.
