# Curated blog review tool

Dev-only in-browser UI for backfilling `feedUrl` and `hasIcon` metadata onto
the Reader onboarding curated blog lists, and for pruning entries whose feeds
have gone dead.

> [!IMPORTANT]
> This is a temporary tool. Once every curated entry has been reviewed and
> the `CuratedBlog` schema is tightened (see [Post-backfill cleanup](#post-backfill-cleanup)),
> this entire directory and its feature flag should be deleted.

## Why this exists

The Reader onboarding subscribe modal renders curated blog "pack cards"
that show a feed icon + name for several recommended feeds at once. The
curated blogs live in `client/reader/onboarding-rsm/curated-blogs/`,
hand-maintained as TypeScript source files of `{ feed_ID, site_ID,
site_URL, site_name }` records grouped by tag.

Two problems with that schema:

1. **No `feedUrl`.** The pack cards need to render feed icons, and the
   Reader follow / subscription components key icon lookups off the
   _feed_ URL — not the _site_ URL. Without `feedUrl` baked into the
   curated source, every card has to make a `read/feed/<id>` round-trip
   on render to discover its own feed URL.
2. **No way to mark entries dead.** Curated lists are a few months
   old. Some feeds have gone away. Without a tool, finding broken
   entries means manually checking ~280 sites.

This tool fixes both: it fetches `read/feed/<id>` for every curated
entry, lets the operator visually verify each one, mark dead entries
broken, and copy back regenerated source with `feedUrl` + `hasIcon`
filled in.

## Enabling and accessing it

The tool is gated behind the `reader/curated-review` feature flag:

- `development.json` and `wpcalypso.json` — `true`
- All other configs — `false`

Visit [`/reader/dev/curated-review`][1] in any environment that has the
flag enabled. The `dev/` prefix in the route is intentional: it makes
clear at a glance that this is not a user-facing surface.

[1]: http://calypso.localhost:3000/reader/dev/curated-review

## The data model

Schema (in `client/reader/onboarding-rsm/curated-blogs/index.tsx`):

```ts
export type CuratedBlog = {
	feed_ID: number;
	site_ID: number;
	site_URL: string;
	site_name: string;
	feedUrl?: string; // ← optional during the backfill
	hasIcon?: boolean; // ← optional during the backfill
};
```

`feedUrl` and `hasIcon` are intentionally **optional** while the
backfill is in progress. Once every file has been reviewed and pasted
back, both fields will be tightened to required and the consumers
(pack cards) will assume they are always present.

## Review workflow

The intended operator workflow per file:

1. **Pick a file from the dropdown.** Only that file's feeds get
   queried (we don't want to hammer the API with all ~280 lookups when
   you're only walking 50). Picking `All files` queries everything.
2. **Walk the rows.** Each row shows the curated entry, the resolved
   feed URL, the feed icon preview (or a placeholder), and chips when
   anything's wrong.
3. **Mark broken** for any row whose feed is dead, redirected to spam,
   or otherwise no longer worth recommending. Marked-broken entries
   are **omitted** from the regenerated source — they don't get an
   `isBroken: true` field, they just stop existing in the curated
   data.
4. **Force `hasIcon: false`** for rows where the API returns a
   non-empty `feed.image` but the icon is junk (default WordPress.com
   placeholder, blank pixel, etc.). The forced override lets the
   operator's eyes overrule the API's `Boolean(feed.image)`.
5. **Copy `<file>.tsx`.** The button regenerates the entire file with
   `feedUrl` + `hasIcon` baked into every entry, and copies it to the
   clipboard.
6. **Paste back** into `client/reader/onboarding-rsm/curated-blogs/<file>.tsx`,
   replacing the existing contents. The serializer is tuned to match
   prettier's output exactly, so a `prettier --write` pass should
   produce **zero whitespace diff** versus the clipboard.

Repeat for the next file.

### Marked-broken vs auto-flagged

Two distinct broken-ish states. Both render with a chip in the row
header.

- **Marked broken** (red `broken — omitted on export` chip). The
  operator clicked `Mark broken`. These entries are dropped from the
  serialized output, and tags whose entries are all dropped are
  dropped too.
- **Auto-flagged** (yellow `auto-flagged` chip). The API returned
  feed metadata, but `feed.feed_URL` was missing — meaning the API
  itself doesn't believe this feed has a canonical URL. Auto-flagged
  rows are **not** automatically omitted; the operator still has to
  click `Mark broken` to omit them. (Sometimes auto-flagged rows are
  recoverable — a transient API hiccup, or a feed that has a working
  `feed.URL` but no `feed_URL`. The operator decides.)

A row can be both at once (auto-flagged AND marked broken). In that
case the manual mark takes precedence visually (red chip wins) and
the entry is omitted on export.

### Filters

- **File** — single-file scope (only that file's feeds are fetched +
  shown) or `All files`.
- **Show only broken / auto-flagged** — narrows the list to rows in
  either broken state. Useful for triaging after a first pass.
- **Show only unmarked** — hides rows the operator has already marked
  broken. Useful for sweeping through the remaining work.

### Persistence

`Mark broken` and `Force hasIcon: false` state are persisted to
`localStorage` so the operator can close the tab and resume later
without losing progress:

- `reader/curated-review/broken-feed-ids` — `Set<number>` of feed IDs
- `reader/curated-review/has-icon-false-feed-ids` — `Set<number>` of feed IDs

Two destructive `Clear all …` buttons in the filter bar nuke each set
(with a `window.confirm` prompt). The actual paste-back is the
permanent record — `localStorage` is just a working buffer.

## Architecture

```
curated-review/
  README.md               this file
  index.tsx               the page
  curated-row.tsx         per-row component (icon, fields, action buttons)
  serialize-curated.ts    pure source-emitter (no DOM)
  use-persisted-feed-ids.ts  generic localStorage Set<number> hook
  style.scss              styles
  test/
    serialize-curated.test.ts
```

### Query scoping (`index.tsx`)

`useQueries` is given **only** the rows for the currently selected
file. Switching the file dropdown rebuilds the queries. `All files`
fires queries for every row.

Each query option spreads:

```ts
{
  ...readFeedQuery( row.entry.feed_ID ),
  meta: { persist: false },
  retry: false,
}
```

- `meta: { persist: false }` keeps these out of Calypso's persisted
  query-state localStorage entry — we don't want hundreds of feed
  responses leaking into every Calypso page load.
- `retry: false` avoids retry storms on permanently-broken feeds.

### `feedUrl` derivation

Unlike Reader's general-purpose `getFeedUrl(...)` helper (which falls
back to `feed.URL` and even `entry.site_URL`), this tool uses
`feed.feed_URL` **only**. If the API doesn't return one, we don't
fabricate a substitute — we auto-flag the entry instead. The whole
point of the backfill is to bake the canonical feed URL into curated
source; falling back would silently bake a non-feed URL.

### Serializer (`serialize-curated.ts`)

Pure, DOM-free, fully unit-tested. Inputs:

- `variableName` — the exported identifier (e.g. `lifestyleBlogs`)
- `tagMap` — the original tag → entries source data
- `getMetadata(entry)` — operator-supplied resolver returning the
  per-row metadata or `null` to omit

Outputs a complete `<file>.tsx` body, including the
`import { CuratedBlogsList } from './index'` line and trailing
newline.

Whitespace, quote style, and key-quoting choices are deliberately
matched to prettier's defaults so paste-back produces zero diff:

- Tabs for indent.
- Single-quoted strings, with double-quote opt-in for values
  containing apostrophes (mirrors prettier's `avoidEscape: true`).
- Trailing commas on every entry / line / array item.
- Hyphenated tag keys like `k-12` are quoted; bare-identifier tags
  are not.
- Strings are escaped via `JSON.stringify(...)` (then re-skinned to
  single quotes when safe), so backslashes / newlines / tabs / control
  characters round-trip correctly.

Entries returned `null` from `getMetadata` are omitted. Tags whose
entries all return `null` are dropped from the output.

### `use-persisted-feed-ids.ts`

Tiny hook: `Set<number>` of feed IDs, persisted to a `localStorage`
key. Exposes `mark`, `unmark`, `toggle`, `clear`. SSR-safe (returns
empty set on the server). Quota / privacy-mode write failures are
swallowed — the in-memory state still works for the active session.

Two instances are mounted in the page, one per persistence key.

## Post-backfill cleanup

Once every curated file has been reviewed and pasted back:

1. Tighten `CuratedBlog` in
   `client/reader/onboarding-rsm/curated-blogs/index.tsx` so
   `feedUrl` and `hasIcon` are required (drop the `?`).
2. Update `client/reader/onboarding-rsm/subscribe-modal/...` (and any
   other consumer) to read `feedUrl` and `hasIcon` directly instead
   of falling back to per-card `read/feed/<id>` lookups.
3. Delete this entire directory (`curated-review/`) including the
   tests.
4. Delete the `reader/curated-review` flag from every `config/*.json`.
5. Drop the `curatedReview` controller in `client/reader/controller.jsx`
   and the route registration in `client/reader/index.ts`.

The `update/reader-onboarding-rsm-curated-blogs-list` PR
([#110600](https://github.com/Automattic/wp-calypso/pull/110600))
introduced the tool; the cleanup PR should reference it for context.
