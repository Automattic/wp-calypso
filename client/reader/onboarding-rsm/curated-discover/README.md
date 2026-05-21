# Curated blog discovery tool

Dev-only in-browser UI for finding new candidate blogs to add to the
Reader onboarding curated lists, on a per-tag basis. Pairs with the
existing `curated-review` tool: discover seeds new entries, review
prunes them.

> [!IMPORTANT]
> This is a temporary tool. It is gated behind the same
> `reader/curated-review` feature flag as the review tool, and should
> be deleted alongside it once curation is settled (see
> [Post-discovery cleanup](#post-discovery-cleanup)).

## Why this exists

The curated lists in `client/reader/onboarding-rsm/curated-blogs/` were
hand-seeded months ago. The existing `curated-review` tool can prune
dead entries, but it has no way to _discover_ new ones. This tool fills
that gap by querying `/read/tags/cards` per tag — the same endpoint
the subscribe modal uses — with `bypass_user_filters=1` so the operator
sees every candidate the index can surface, including blogs they
already follow / have dismissed / etc.

## Enabling and accessing it

Same flag as `curated-review`: `reader/curated-review` (declared only
in `config/development.json`, deliberately absent from every other
config). The route is local-only.

Visit [`/reader/dev/curated-discover`][1].

## Workflow

The intended operator workflow per file:

1. **Pick a file from the dropdown.** The page lists every tag the
   selected file curates, each as a collapsed section.
2. **Open a tag section.** That triggers the `/read/tags/cards`
   request for the single tag, with `bypass_user_filters=1`. Each
   returned candidate is also enriched via `read/feed/<id>` for
   canonical `feed_URL`, icon, and subscriber count.
3. **Walk the candidates.** Each row shows the same metadata grid as
   the curated-review tool plus a subscriber count. Already-curated
   feeds for _this same tag_ are filtered out automatically (they
   would round-trip through the export as duplicates).
4. **Click `Add to curated`** for each promising candidate. The
   resolved `feed_URL` and `has_icon` are captured at that moment.
5. **Optionally force `hasIcon: false`** on added rows whose icon
   the API returned but the operator deems junk. The override is
   persisted with the rest of the added entry.
6. **Load more** to keep digging the same roll. Each click pages
   through the endpoint via the `page` arg, appending the next 18
   candidates to the existing list (instead of replacing them).
7. **Refresh** if you want a different roll instead. Bumping
   `refresh` changes the React Query key, drops the accumulated
   pages, and re-fetches page 1 with a fresh ES shard routing.
8. **Click `Copy <file>.tsx`.** The clipboard receives the entire
   merged file: existing entries kept verbatim, new additions
   prepended at the top of each tag's array.
9. **Paste back** into
   `client/reader/onboarding-rsm/curated-blogs/<file>.tsx`,
   replacing the existing contents.

The candidate list is sticky: tabbing away to another browser tab
and back, or collapsing and re-opening a tag section, will not
re-fetch the recommendations. The cards endpoint shuffles results
per call (without seeding), so any silent refetch would swap the
list out from under the operator. The only paths to a new fetch
are clicking **Refresh recommendations** (full re-roll) or
**Load more candidates** (next page appended).

After paste-back, the typical next pass is to run the _review_ tool
against the same file to mark obvious duds broken before merging.

## Same-tag dedup

If `/read/tags/cards` returns a feed that's already in `tagMap[tag]`
for the current file, that candidate is hidden — re-adding it would
produce a duplicate row in the export. **The dedup is per-tag, not
per-file or global**: a feed already curated under `nature` can still
appear as a candidate (and be added) under `science` in the same
file.

## Bypass param

The frontend always sends `bypass_user_filters=1`. The backend skips:

- The post-filter `wpcom_subs_is_subscribed` / blocked / dismissed
  checks in `WPCOM_Global_Tag_Recommendations_Sites::get_recommendations()`.
- The ES `must_not followed_blog_ids` query in
  `get_es_query_builder()`.

Quality filters (private/spam/mature/disconnected/staging/recency)
are still applied — those describe the feed itself, not the user.

## Persistence

Added candidates are persisted per file in `localStorage`:

- `reader/curated-discover/added/<file-slug>` — the full
  `Record<tag, CuratedBlog[]>` of additions for that file.

`Clear all added for <file>` nukes the entry (with a `window.confirm`).
The actual paste-back is the permanent record — `localStorage` is just
a working buffer.

## Architecture

```
curated-discover/
  README.md                    this file
  index.tsx                    the page (file picker + per-tag sections)
  discover-row.tsx             per-candidate component
  use-tag-recommendations.ts   single-tag /read/tags/cards + readFeedQuery enrichment
  use-added-candidates.ts      persisted Record<tag, CuratedBlog[]>
  serialize-with-additions.ts  pure source emitter wrapping serializeCurated
  style.scss                   styles
  test/
    serialize-with-additions.test.ts
    use-added-candidates.test.ts
```

### `use-tag-recommendations.ts`

Wraps the cards endpoint with:

- `tags: [ tag ]` (one per request).
- `bypass_user_filters: 1`.
- `site_recs_per_card: 18`, `tag_recs_per_card: 0`.
- `refresh` plumbed from caller for shard rotation.
- `enabled` gated on `isOpen` so collapsed tag sections never fetch.

For each returned blog it dispatches `readFeedQuery(feed_ID)` to
resolve `feed_URL`, `image`, and `subscribers_count`. The hook
returns a unified `DiscoverCandidate[]` with everything the row
component needs.

### `serialize-with-additions.ts`

Builds a merged `tagMap` where each tag is `[...reverse(additions),
...existing]` (newest at top, per the spec) and delegates to
`serializeCurated` from the curated-review tool. Whitespace, quote
style, and key-quoting choices are inherited so paste-back produces
zero whitespace diff after `prettier --write`.

## Post-discovery cleanup

When curation is settled and the dev tools are retired:

1. Delete this directory (`curated-discover/`).
2. Delete the sibling `curated-review/` directory (its README has
   the original cleanup checklist).
3. Drop both controllers (`curatedReview`, `curatedDiscover`) from
   `client/reader/controller.jsx`.
4. Drop both route registrations from `client/reader/index.ts`.
5. Drop the `CURATED_FILES` re-export from
   `client/reader/onboarding-rsm/curated-blogs/files.ts` (or delete
   the file if no other code uses it).
6. Delete the `reader/curated-review` flag from
   `config/development.json`.

[1]: http://calypso.localhost:3000/reader/dev/curated-discover
