# Reader Social

Shared UI primitives for Reader's third-party social-network surfaces: Bluesky / ATProto (shipping under the user-facing label "ATmosphere") today, Mastodon next, additional protocols later.

This directory hosts shared UI primitives and a small number of protocol-agnostic state containers (the composer provider). It owns no routes, no controllers, and no top-level pages. The protocol-specific shells live next to it (e.g. `client/reader/atmosphere/`, `client/reader/mastodon/`) and import from here.

## Scope

In scope:

- Presentational React components rendered by per-protocol shells (profile cards, feed lists, post cards, post-card subcomponents).
- Protocol-agnostic state containers driven by per-protocol config (`composer/` — see "Composer" below).
- Helpers tightly coupled to those components (HTML sanitisation, analytics context, link-pattern primitives).
- Per-component styles (`style.scss` next to each component).
- Tests for everything above.

Out of scope (lives elsewhere):

- Routes / `controller.tsx` / `index.tsx` page entrypoints — `client/reader/<protocol>/`.
- Data fetchers and React Query hooks — `packages/api-core/` and `packages/api-queries/`.
- Connection and account-management flows specific to one protocol — `client/reader/<protocol>/`.
- Anything that talks to Redux state or the legacy data-layer — new social code is React Query only.

## Directory layout

```
client/reader/social/
  index.ts                      # public barrel — only export from here
  profile-card.tsx              # SocialProfileCard (used by every protocol's profile/verify view)
  account-row.tsx               # SocialAccountRow — one row in an account list (avatar / name / handle / bio / follow button)
  account-list.tsx              # SocialAccountList<T> — generic wrapper around SocialFeedList<T> rendering each item via SocialAccountRow
  author-profile-header.tsx     # AuthorProfileHeader — back-button shim for the profile route (slice 6)
  author-profile-panel.tsx      # SocialAuthorProfilePanel — generic author-profile surface, both protocols wrap (slice 6)
  profile-header-skeleton.tsx   # SocialProfileHeaderSkeleton — layout-stable placeholder used by the panel (slice 6)
  style.scss                    # SocialProfileCard + skeleton styles
  test/
    profile-card.test.tsx
    author-profile-header.test.tsx

  components/                   # mirror of client/reader/discover/components/ shape
    feed-list/
      index.tsx                 # SocialFeedList<T> — generic list shell, accepts a renderItem
      feed-list-skeleton.tsx
      feed-list-empty.tsx       # loading / empty / per-error-kind EmptyContent variants
      style.scss
      test/

    post-card/
      index.tsx                 # SocialPostCard — thin shell, dispatches to subcomponents
      analytics-context.tsx     # SocialAnalyticsProvider + useSocialAnalytics
      post-card-header.tsx      # avatar + name/handle + timestamp + repost reason + reply context
      post-card-body.tsx        # sanitized post.html injected as HTML
      post-card-counts.tsx      # replies / reposts / likes row + stats row on the focused thread root
      post-card-link.tsx        # card-link accessibility pattern (one real <a> + ::after overlay)
      post-card-embed.tsx       # dispatcher on embed.type
      post-card-embed-images.tsx
      post-card-embed-video.tsx
      post-card-embed-external.tsx
      post-card-embed-quote.tsx
      post-card-embed-quote-tombstone.tsx
      post-card-embed-quote-with-media.tsx
      sanitize-post-html.ts     # DOMPurify allow-list helper
      style.scss
      test/

  composer/                     # generic composer shell, driven by per-protocol ComposerConfig (slice 7)
    index.ts                    # public barrel — only export from here
    composer-provider.tsx       # ComposerProvider + ComposerMode union + useComposer / useOptionalComposer
    composer-config.tsx         # ComposerConfig<TError, TParams, TResult> + ComposerMediaSlot + Translate re-export
    composer-modal.tsx          # ComposerModal — generic modal driven by useComposerConfig()
    composer-footer.tsx         # grapheme count + submit button + media-trigger slot
    composer-pinned-context.tsx # parent / quote preview pinned at the top
    composer-textarea.tsx       # autosizing textarea + submit-on-cmd-enter
    grapheme-count.ts           # Intl.Segmenter-based grapheme count
    test-config.ts              # testComposerConfig fixture for shell tests
    triggers/
      compose-fab.tsx           # ComposeFab — bottom-right floating button
      timeline-compose-pill.tsx # TimelineComposePill — inline avatar + "What's on your mind?" pill
    style.scss
    test/
```

The atmosphere thread surface (`ThreadTree`, `ThreadNode`, `ThreadTombstone`,
`ThreadTreeSkeleton`) lives at `client/reader/atmosphere/thread-tree/` —
the layout is bsky-shaped (AT-URI-based parent walking, `AtmosphereThreadNode`
recursion, scroll-to-target via at:// URI). When Mastodon's slice 5 ships
its own thread view, it adds a sibling under `client/reader/mastodon/`.

## Architectural decisions

### Bluesky-shaped types today, abstract when Mastodon arrives

`SocialPostCard` and the embed dispatcher take `AtmosphereFeedItem` from `@automattic/api-core` directly — there is no protocol-agnostic `SocialPost` shape yet. This is deliberate: a generic shape designed against one protocol is just that protocol's shape with extra layers, and Mastodon's data model (`content` vs `html`, `media_attachments` vs `embed`, `reblog` vs `reason`, no native quotes) is non-trivially different.

When Mastodon's shape is concretely in front of us, decide between:

- **Refactor in place** — introduce a `SocialPost` shape with per-protocol mappers, if Bluesky and Mastodon overlap cleanly enough.
- **Fork** — `BlueskyPostCard` / `MastodonPostCard` siblings sharing only the truly-protocol-agnostic bits below.

Don't speculate ahead of that signal. Adding a generic shape now will make the abstraction wrong in a way only the second protocol can reveal.

### What's already protocol-agnostic (reuse as-is for Mastodon)

- `SocialProfileCard` — generic over a `stats[]` array; accepts plain-text `bio` or sanitised `bioHtml`. Slice-6 widened the prop set so the same component covers both the slim verify/your-own-connection layout and the full author-profile header: `banner`, `displayName`, `handle`, and `headerActions` switch the component into a richer band-and-stats layout (banner above avatar, name + `@handle`, action slot for buttons/links). Already used by ATmosphere for both surfaces; intended for Mastodon.
- `SocialFeedList<T>` — generic over item type via `renderItem` and `itemKey`. Mastodon plugs in a different data hook and a different `renderItem` callback; the list shell, sentinel-based pagination, skeleton, and error variants don't change.
- `PostCardLink` — the card-link accessibility pattern (one real `<a>` + `::after` overlay + nested `position: relative; z-index: 1` anchors).
- `sanitizePostHtml` — DOMPurify wrapper with allow-list (`<p> <br> <a>` / `href, rel, target, data-id`, `ALLOW_DATA_ATTR: false`) and a scoped `afterSanitizeAttributes` hook that forces `target="_blank"` and `rel="nofollow noopener noreferrer"` on every surviving anchor (post body and bio alike — `SocialProfileCard` reuses the same hardening via `sanitizeReaderSocialHtml`). The `data-id` attribute is carried by @-mention anchors so `<PostCardBody>` can route mentions in-app via `getProfileUrl` without parsing the href.
- `SocialAnalyticsProvider` / `useSocialAnalytics` — the per-protocol shell wraps its tree with a `source` ('atmosphere' | 'mastodon' | …) + `connectionId` + `onClick(event, props)` callback, plus optional URL resolvers (`getThreadUrl`, `getProfileUrl`). The post-card subcomponents call into this context instead of dispatching `recordReaderTracksEvent` directly. Adding a protocol just means adding a `source` value, wiring up the protocol's per-event Tracks call in the shell, and binding the protocol's URL builders to the resolvers.
- `SocialAuthorProfilePanel` (slice 6) — generic author-profile surface that owns the layout (back-button + profile header + feed list), the `profile_viewed` / `profile_error_shown` / `profile_retry_clicked` / `profile_back_to_timeline_clicked` Tracks events with ref-based dedupe, and the `SocialAnalyticsProvider` value. Per-protocol wrappers inject already-fetched query results, mappers, error projectors, URL builders, and copy. Atmosphere's wrapper is `client/reader/atmosphere/author-profile-panel.tsx`; Mastodon's is `client/reader/mastodon/author-profile-panel.tsx`. Both shrink to ~150 lines of config.
- `SocialProfileHeaderSkeleton` (slice 6) — layout-stable placeholder used as the default `renderProfileLoading` slot of `SocialAuthorProfilePanel`. Mirrors `SocialProfileCard`'s sizing so the surface doesn't shift when profile data resolves.
- `AuthorProfileHeader` — back-button shim taking `timelineUrl: string`. Both protocols use it directly via the shared panel.
- `SocialAccountRow` — one row in an account list (avatar / name / handle / bio / follow button), with optional Follows you badge and self-row mode. Card-link overlay pattern: the whole row is a click target via a `::after` overlay on the timestamp-style anchor; the follow button sits above the overlay via `position: relative; z-index: 1` so it stays individually clickable. Caller maps the protocol shape to row props.
- `SocialAccountList<T>` — thin generic wrapper around `SocialFeedList<T>` that renders each item via `<SocialAccountRow {...renderItem(item)} />`. Caller provides the `renderItem` mapper from protocol shape to `SocialAccountRow` props; the list shell, sentinel-based pagination, skeleton, and error variants are inherited unchanged. Optionally renders a follow-list header above the list via the `header` prop (`{ displayName, handle, count, mode: 'followers' | 'following', isPending }`) so followers/following surfaces look identical across protocols. The header shows the actor's display name (or `@handle` fallback) and a pluralized count line; while `isPending` it renders a layout-stable skeleton, and when `count` is `null` (profile fetch errored) it renders the heading only.

### What's Bluesky-specific today (likely needs forking or refactoring)

- `SocialPostCard` and every `post-card-*` subcomponent take `AtmosphereFeedItem`.
- `PostCardEmbed`'s discriminated union (`'images' | 'video' | 'external' | 'quote' | 'quote_with_media'`) matches the backend `ReaderATmosphere_Normalizer` shape. Mastodon attachments are different.
- `SocialPostCard`'s `variant: 'default' | 'compact'` covers top-level and quote-embed renderings — Mastodon has no native quote concept and may not need `compact` at all.

### Data layer

This directory does no data fetching. Per-protocol shells consume:

- `@automattic/api-core` — typed fetchers + error classifiers + query keys.
- `@automattic/api-queries` — React Query hooks (`useInfiniteQuery` for timelines).

New social code is React Query end-to-end. Do not add new Redux data-layer handlers, do not add `connect()` HOCs, do not import from `client/state/data-layer/wpcom/read/`.

### Tracks events

Use the `SocialAnalyticsProvider` context, not direct `recordReaderTracksEvent` calls inside post-card subcomponents. The provider's `onClick(event, props)` is wired up in the per-protocol shell (e.g. `TimelinePanel`) so:

- Per-protocol shell decides the event name (`calypso_reader_atmosphere_timeline_post_clicked` vs `calypso_reader_mastodon_timeline_post_clicked`).
- Subcomponents pass protocol-agnostic props (`post_uri`, `has_embed`, `embed_type`, `is_repost`, `is_reply`, …) without knowing the prefix.
- Connection identity (`connection_id`) is added by the provider, not threaded through prop drilling.

All Reader Tracks events use the `calypso_reader_*` prefix per `client/reader/AGENTS.md`. Emit them via the `recordReaderTracksEvent` Redux action — `recordTrack()` from `client/reader/stats` is deprecated.

Tracks events emitted from click-destination surfaces gain a `destination` property so dashboards can split by routing behaviour without renaming the events:

- Thread-routing surfaces (timestamp anchor, quote embed, replies count, reply-context preface) carry `destination: 'in_app_thread' | 'bsky_app'` (slice 5).
- Profile-routing surfaces (author chip via `_author_clicked`, repost preface via the slice-6 `_repost_author_clicked` event) carry `destination: 'in_app' | 'bsky_app'` (slice 6).

The slice-6 `calypso_reader_<source>_timeline_repost_author_clicked` event additionally carries `reposter_did`, `reposter_handle`, and the original `post_uri`. The shell rewrites the `_timeline_` prefix to a surface-specific one (e.g. `_thread_`) inside its `onClick` callback exactly as for the existing events.

### URL resolution (slice 5+)

Post-card subcomponents that re-target click destinations read optional URL
resolvers from the analytics context. Two resolvers exist today, both with the
same null-means-fall-back contract:

```ts
interface SocialAnalyticsContextValue {
	// ...
	// Slice 5: in-app thread URL for a post URI, or null to fall back.
	getThreadUrl?: ( postUri: string ) => string | null;
	// Slice 6: in-app profile URL for an author ref, or null to fall back.
	// `id` is the universal protocol-agnostic identifier (DID for atmosphere,
	// numeric account id for Mastodon). `did` is kept as an atmosphere-named
	// alias so existing call sites keep working — both fields point to the
	// same value when post-card-header passes them.
	getProfileUrl?: ( ref: {
		id?: string | null;
		did?: string | null;
		handle?: string | null;
	} ) => string | null;
}
```

Surfaces consuming `getThreadUrl` (slice 5): the timestamp anchor in
`<PostCardHeader>`, `<PostCardEmbedQuote>`, `<PostCardCounts>`'s replies
count, and `<PostCardHeader>`'s reply-context preface.

Surfaces consuming `getProfileUrl` (slice 6): `<PostCardHeader>`'s author
chip, `<PostCardHeader>`'s repost preface (the reposter name),
`<PostCardBody>` for inline `<a data-id>` @-mention anchors in post
content, and `<SocialProfileCard>` for inline `<a data-id>` @-mention
anchors in author bios. The body and profile-card components intercept
the click, read `data-id`, call `getProfileUrl({ id, handle, did })` with
the same value in all three fields, and route via `page()` when the
resolver returns an in-app URL. The three-field shape lets per-protocol
resolvers pick whichever they understand and validate: atmosphere's
resolver tries `handle` (`HANDLE_RE`) then `did` (`DID_RE`); Mastodon's
reads `id`. Backends stamp either a DID (atmosphere, when known) or a
numeric account id (Mastodon), and atmosphere falls back to a handle in
`data-id` when no DID is available. Modifier-clicks (cmd/ctrl/middle/
shift/alt) always pass through. When `data-id` is present but the
resolver returns null the click falls through to the external href AND
the body/profile-card fires a
`calypso_reader_<source>_timeline_mention_unresolved` Tracks
event so a backend↔frontend desync is observable in dashboards.

When the resolver returns a string, the click target is in-app (same tab, no
`rel`). When it returns `null` (or the resolver isn't set), the slice-4
bsky.app fallback is used (`https://bsky.app/profile/<handle>` for
`getProfileUrl`, `target="_blank" rel="noopener noreferrer"`). Per-protocol
shells (`TimelinePanel`, `ThreadPanel`) bind the connection ID and the
protocol-specific URL builders (e.g. `getThreadUrl` and `getProfileUrl` from
`client/reader/atmosphere/route.ts`).

### HTML sanitisation (defence-in-depth)

Every place this directory injects HTML from a third-party network — `SocialProfileCard` for bios, `PostCardBody` for post content — runs the input through DOMPurify with a tight allow-list **before** handing it to React's HTML-injection prop. The backend already runs `wp_kses` over the same content with a matching allow-list, but the client double-sanitises so a future backend change can't silently widen what reaches the DOM.

Allow-list shape:

- `ALLOWED_TAGS: ['p', 'br', 'a']` for post content (extend cautiously for new protocols).
- `ALLOWED_TAGS: ['p', 'br', 'a', 'span']` for profile bios (Mastodon emits `<span>` mention scaffolding).
- `ALLOWED_ATTR` for post content: `href`, `rel`, `target`, `data-id`. The `data-id` attribute carries the protocol's stable author identifier on @-mention anchors so `<PostCardBody>` can route mentions in-app via `getProfileUrl` without parsing the href.
- `ALLOWED_ATTR` for profile bios: `href`, `rel`, `target`, `class`, `data-id`, `data-tag`. Bios carry the same @-mention `data-id` and hashtag `data-tag` contracts as post content; `<SocialProfileCard>` intercepts bio mention and hashtag clicks via the same pattern as `<PostCardBody>`, routing through `getProfileUrl` and `getTagUrl` respectively.
- `ALLOW_DATA_ATTR: false` on both post content and profile bios. DOMPurify allows every `data-*` attribute by default; we restrict to the explicit allow-list above so a future backend change can't smuggle a new `data-*` attribute (e.g. `data-tracking`) through to the DOM.
- `ADD_URI_SAFE_ATTR: ['data-id']` on both post content and profile bios. DOMPurify scheme-checks every attribute value containing a colon and would otherwise drop `data-id="did:plc:…"` for atmosphere DIDs as an unknown URI scheme. Use `ADD_URI_SAFE_ATTR` (extends DOMPurify's defaults) rather than `URI_SAFE_ATTRIBUTES` (replaces them and would drop `xml:lang`, `xlink:href`, etc.). Don't switch to `ALLOW_UNKNOWN_PROTOCOLS: true` — that would also loosen `href` validation.
- DOMPurify's default scheme allow-list strips `javascript:` / `data:` / etc. on `href`. Don't extend it.
- A scoped `afterSanitizeAttributes` hook (installed only while `sanitize-post-html.ts` sanitizes Reader Social HTML, and reused by `profile-card.tsx` via `sanitizeReaderSocialHtml`) forces `target="_blank"` and `rel="nofollow noopener noreferrer"` on every surviving `<a>`. Belt-and-suspenders against window-opener leaks and against upstream HTML that omits `target`. Pre-existing rel tokens (e.g. `rel="me"` for IndieAuth-style verification) are preserved.

### Card-link accessibility pattern

`PostCardLink` implements [Inclusive Components' card-link pattern](https://inclusive-components.design/cards/):

- Exactly one real `<a>` per card unit (the post timestamp), with a `::after` pseudo-element covering the whole unit as the click target. The pattern applies both to top-level cards (default variant — the timestamp anchor is derived internally from `analytics.getThreadUrl(post.uri) ?? post.permalink`) and to compact cards used inside a quote embed (compact variant — the consumer passes a `cardLink` prop on `<SocialPostCard>`, which is forwarded to `<PostCardHeader>` as `timestampLink` and renders the compact timestamp as an anchor with the supplied href/onClick/target/rel).
- Inner clickable elements (author chip, external embed, quote embed, body inline anchors injected via `PostCardBody`) are raised to `position: relative; z-index: 1` so they sit above the overlay and remain individually clickable. The full raise list lives in `client/reader/social/components/post-card/style.scss`.
- Card text remains selectable (the overlay sits behind text via `z-index`-stacking, not in front of it).

Don't replace this with a `<a>`-wrapping-the-whole-card structure: when the body content contains inline anchors (mentions, hashtags, URLs) injected via `innerHTML`, the parser does not split the surrounding `<a>` and the DOM ends up with literal nested anchors with undefined click behaviour. The quote embed (`PostCardEmbedQuote`) used to wrap its compact card in an outer `<a>` for exactly this reason and has since been refactored to use the `cardLink` prop instead — copy that pattern for any new quote-shaped surface. `onClick` on a `<div>` is also out (kills keyboard navigation and screen-reader semantics).

### Inline video — thumbnail vs. expanded

`<PostCardEmbedVideo>` defaults to thumbnail-only (slice-4 behaviour, used by
the timeline). When `expanded={true}`, the component renders a native
`<video>` element pointed at the HLS playlist exposed in
`AtmosphereEmbedVideo.playlist` (served by `video.bsky.app`):

- Safari / iOS WebKit play HLS natively — the playlist is set as `video.src`.
- Other browsers lazy-load `hls.js` via dynamic `import()`, so timeline pages
  and thread pages without expanded video pay zero bytes for it. The Reader
  webpack chunk only pulls `hls.js` in when a thread root carries video AND
  the browser lacks native HLS support.

The thumbnail is used as the `<video poster>` so users see a frame before
hitting play. `<SocialPostCard>` forwards `expandedVideo` only for the
highlighted root node inside `<ThreadTree>` — replies and parents render
as thumbnail buttons by default. Clicking a thumbnail flips the embed to
the player inline (no navigation) and autoplays inside the click's
user-gesture window, so video posts deeper in a thread don't require a
detour through the post detail view to play.

This mirrors what bsky.app's own web app and other modern Bluesky clients do.
The static `embed.bsky.app` widget was an earlier attempt but doesn't include
an inline player for video posts — it's a "view on bluesky" surface, not a
playback surface.

CSP hosts required for the ATmosphere thread view
(`client/server/pages/index.js`):

- `img-src` += `https://cdn.bsky.app` (avatars + post images),
  `https://video.bsky.app` (video poster thumbnails),
  `https://video.cdn.bsky.app` (the thumbnail URL 302-redirects here, same
  redirect pattern as HLS segments).
- `media-src` += `blob:` (MediaSource object URLs created by hls.js when it
  attaches to the `<video>` element on non-Safari browsers),
  `https://video.bsky.app`, `https://video.cdn.bsky.app` (Safari native HLS
  path; segment URLs 302-redirect from `video.bsky.app` to the CDN).
- `connect-src` += same two `video.*` hosts (`hls.js` follows the same
  redirect via XHR/fetch).

hls.js is constructed with `enableWorker: false` so transmuxing runs on
the main thread. That keeps a `worker-src blob:` allowance off the CSP —
hls.js's default worker is loaded from a runtime-generated `blob:` URL,
which would otherwise need to be permitted. Bluesky videos are short
enough that main-thread transmuxing is fine; revisit if we ever ship
longer-form video.

### Click destinations

As of slice 5, the card-link / quote / replies-count / reply-context surfaces all route in-app via `getThreadUrl` when the resolver is set by the per-protocol shell. As of slice 6, the post-author chip and the repost preface name route in-app via `getProfileUrl` on the same fall-back-to-bsky.app contract. The bsky.app `target="_blank"` fallback is retained for contexts where no resolver is bound.

When wiring a new card surface, route through `PostCardLink` rather than spreading `target="_blank"` anchors directly across subcomponents. Consult `getThreadUrl` and `getProfileUrl` from the analytics context before constructing any post- or profile-destination URL.

### Like / Favorite interactions

Both protocols expose a per-viewer interaction state on each feed item.
ATmosphere uses `viewer: { like: string | null; repost: string | null }` —
the value is the user's like/repost record URI (or `PENDING_LIKE_URI`
during the optimistic window). Mastodon uses
`viewer: { favourited: boolean; reblogged: boolean }` (the upstream
Mastodon API field names are British-spelled and stay that way at the
wire boundary). The field is optional during the backend rollout window
on both protocols; consumers must treat a missing `viewer` as "not liked
/ not favorited".

The Mastodon mapper (`mappers/mastodon.ts`) projects the booleans onto the
shared `SocialPost.viewer.{like,repost}` shape using a marker string
(`'favorited'` / `'reblogged'`) for true and `null` for false. That keeps
`<LikeButton>` and consumers protocol-agnostic — every consumer reads
`Boolean(post.viewer?.like)` and gets the right answer for both protocols.

`<LikeButton>` is presentational and protocol-agnostic. It calls
`useLikeAction(post)` from `<LikeProvider>` (defined in
`like-context.tsx`). When no provider is mounted (`action.supported ===
false`), the button renders an inline static count (icon + count +
screen-reader text) — **not** `null`, and **not** delegated back to
`<PostCardCounts>` for a fallback. Keeping the fallback inside the
button means a panel that passes `connectionId` to `<SocialPostCard>`
without also mounting a `<LikeProvider>` shows a populated cell instead
of an empty one. `<PostCardCounts>` therefore always renders
`<LikeButton>` unconditionally.

Each protocol shell wires its own adapter hook factory:

- ATmosphere: `client/reader/atmosphere/use-atmosphere-like-action.ts`
  exports `makeUseAtmosphereLikeAction(connectionId)`. It calls
  `useCreateLikeMutation()` / `useDeleteLikeMutation()` from
  `@automattic/api-queries`, uses `rkeyFromUri(viewer.like)` to derive the
  delete key (returns `null` for `PENDING_LIKE_URI`, preventing a DELETE
  with a fake rkey), and emits the labels "Like" / "Like, %d like(s)".
  Tracks events: `_like_clicked`, `_unlike_clicked`, `_like_error_shown`.
- Mastodon: `client/reader/mastodon/use-mastodon-like-action.ts`
  exports `makeUseMastodonLikeAction(connectionId)`. It calls
  `useCreateMastodonLikeMutation()` /
  `useDeleteMastodonLikeMutation()`, uses `post.uri` (the status_id)
  for the delete call, and emits the labels "Favorite" /
  "Favorite, %d favorite(s)". Tracks events: `_favorite_clicked`,
  `_unfavorite_clicked`, `_favorite_error_shown`.

Both mutation hooks optimistically patch every cached query under their
protocol's `readerXxxKeys.all` (timeline / author-feed / tag-feed pages
plus thread-tree nodes recursively), then restore snapshots on error.

The connection ID is captured by the adapter factory at panel mount time
(`makeUse…LikeAction(connection.id)`) and lives inside the closure passed
to `<LikeProvider value={…}>`. `<PostCardCounts>` does not need to know
about it; `<LikeButton>` reads its action straight from the provider via
`useLikeAction(post)`. Any future interactive count button (repost,
follow, bookmark) should follow the same provider-injected adapter
shape rather than reading connection identity from global state or
hard-coding protocol logic into the shared button.

### Repost / Boost interactions

Both protocols expose a per-viewer repost state on each feed item.
ATmosphere uses `viewer.repost: string | null` — the value is the
user's repost record URI (or `PENDING_REPOST_URI` during the optimistic
window). Mastodon uses `viewer.reblogged: boolean`. The Mastodon mapper
projects the boolean onto the shared `SocialPost.viewer.repost` shape
using the marker string `'reblogged'` so consumers can read
`Boolean(post.viewer?.repost)` regardless of protocol.

`<RepostButton>` is presentational and protocol-agnostic. Like
`<LikeButton>`, it calls `useRepostAction(post)` from `<RepostProvider>`
(defined in `repost-context.tsx`). When no provider is mounted, the
button renders an inline static count — **not** `null`. Same rule as
`<LikeButton>`: the fallback lives inside the button so panels that
pass `connectionId` without also mounting a provider don't end up with
empty cells.

Two render branches by viewer state:

- **Reposted / boosted** — plain `<button aria-pressed="true">`. Clicking
  it fires the delete-mutation directly; no menu opens. Loses access to
  the Quote-post menu item on a reposted post; that's a known follow-up.
- **Not reposted** — `<Dropdown>` from `@wordpress/components` whose
  toggle is the same shape of button (`aria-haspopup="menu"`). The menu
  has two `<MenuItem>`s: the action item (label provided by the adapter
  — "Repost" for ATmosphere, "Boost" for Mastodon) and "Quote post"
  (disabled when `action.canQuote === false`). ATmosphere sets
  `canQuote: Boolean(analytics.onQuoteClick && post.cid)` — both
  composer-presence and the AT-Proto strong-ref check are required;
  the item opens the quote composer via `analytics.onQuoteClick`. Mastodon sets
  `canQuote: Boolean(analytics.onQuoteClick)` — no `cid` requirement
  since Mastodon's quote contract uses a numeric status id. Mastodon
  4.5+ supports native quote posts via `quoted_status_id`;
  `buildParams` for `kind: 'quote'` sets that field plus a
  client-only `quotedFallbackPermalink` hint. The mutation wraps the
  fetcher with a `bad_request` retry: when the upstream rejects the
  quote (instance < 4.5 or quoting disabled, surfaced as 400) it omits
  `quoted_status_id` and appends the permalink to `status` (separated
  by a blank line) before retrying once.

Each protocol shell wires its own adapter hook factory:

- ATmosphere: `client/reader/atmosphere/use-atmosphere-repost-action.ts`
  exports `makeUseAtmosphereRepostAction(connectionId)`. It calls
  `useCreateRepostMutation()` / `useDeleteRepostMutation()` from
  `@automattic/api-queries`, uses `rkeyFromUri(viewer.repost)` to derive
  the delete key (returns `null` for `PENDING_REPOST_URI`, preventing a
  DELETE with a fake rkey), guards the create on missing `post.cid`, and
  emits the labels "Repost" / "Repost, %d repost(s)" / "Undo repost, %d
  repost(s)". Tracks events: `_repost_clicked`, `_unrepost_clicked`,
  `_quote_clicked`, `_repost_error_shown`. The `quote()` action delegates
  to the analytics context's `onQuoteClick`, opening the composer in
  quote mode (the only surface for quote actions after the standalone
  QuoteButton was retired).
- Mastodon: `client/reader/mastodon/use-mastodon-repost-action.ts`
  exports `makeUseMastodonRepostAction(connectionId)`. It calls
  `useCreateMastodonRepostMutation()` / `useDeleteMastodonRepostMutation()`,
  uses `post.uri` (the status_id) for the delete call, and emits the
  UK-spelled labels "Boost" / "Boost, %d boost(s)" / "Undo boost, %d
  boost(s)". Tracks events: `_boost_clicked`, `_unboost_clicked`,
  `_boost_error_shown`, `_quote_clicked`. `canQuote` is true when
  `analytics.onQuoteClick` is set; the quote contract (native 4.5+
  with `bad_request` text-fallback) is described in the `canQuote`
  paragraph above and implemented in `createMastodonPostMutation`.

Both mutation hooks optimistically patch every cached query under their
protocol's `readerXxxKeys.all` (timeline / author-feed / tag-feed pages
plus thread-tree nodes recursively), then restore snapshots on error.

The connection ID is captured by the adapter factory
(`makeUse…RepostAction(connection.id)`) and lives inside the closure passed
to `<RepostProvider value={…}>`; `<RepostButton>` reads its action via
`useRepostAction(post)`. Mirrors the like / favorite flow.

### Composer (slice 7)

The reply / quote / standalone composer is a generic shell driven by a
per-protocol `ComposerConfig<TError, TParams, TResult>`. The shell lives
under `composer/`; per-protocol configs live in `client/reader/<protocol>/composer-config.tsx`.

Shell pieces:

- `<ComposerProvider connectionId={…} config={…}>` owns the open/close
  mode state, captures the trigger element so focus restores on close,
  and (when the config supplies `useMedia`) hosts the media-attachment
  state at provider lifetime — outlasting the modal's mount so deferred
  blob-URL revocation can outlive the timeline staleTime.
- `<ComposerModal />` renders the modal shell, runs the mutation, fires
  the per-mode Tracks events, and routes the success notice. It reads
  the active config via `useComposerConfig()`, never via a prop.
- Triggers (`<ComposeFab />`, `<TimelineComposePill />`) call
  `openComposer({ kind, … })` against the provider. Triggers do not know
  the protocol — they call into the union and the provider's
  `supportedModes` guard drops unsupported kinds (e.g. quote on
  Mastodon) before they reach state.
- `useOptionalComposer()` returns `null` outside a provider — panels
  rendering reply buttons use this to gate the `onReplyClick` handler so
  shells without a composer mounted (tests, embeds) still render.

Per-protocol `ComposerConfig` supplies:

- `useLimit(connectionId)` — hook returning the per-render grapheme cap.
  ATmosphere returns its static 300 (Bluesky's cap is protocol-wide).
  Mastodon reads `max_characters` from the home instance's config via
  `useMastodonInstanceConfigQuery` and falls back to 500 (stock default)
  while the query is pending or has errored. The hook is called
  unconditionally from `<ComposerModal>` (rules of hooks) and accepts
  `null` for the connection id — implementations must handle that case
  (the value is unused while the modal is closed). See
  `client/reader/mastodon/use-mastodon-composer-limit.ts` for the
  Mastodon shape.
- `supportedModes` — `'reply' | 'quote' | 'standalone'` allow-list.
  Unsupported kinds are silently dropped at `openComposer`.
- `mutationFactory(queryClient)` — TanStack mutation options. Uses the
  consumer's `QueryClient` per the `client/reader/AGENTS.md`
  mutation-factory rule. The `TContext` slot is intentionally widened
  to `any` so per-protocol factories carry their own onMutate snapshot
  shape without leaking it into the generic config.
- `buildParams(mode, text)` — protocol-specific wire shape (atmosphere's
  `reply.root` / `reply.parent` strong-refs vs Mastodon's
  `in_reply_to_id`).
- `errorMessage(error, translate)` — per-error-kind copy. Returns
  `ReactNode` so the reconnect URL embeds via `{{a}}` interpolation.
  **Always include a `default:` arm with `err satisfies never;`** so a
  future kind widening doesn't return `undefined` and render an empty
  toast (this is the same lesson as the like/repost adapters).
- `successNotice(mode, result, translate)` — text + optional in-app
  thread URL for the "View" button on the success notice.
- `tracks.{opened, published, errorShown}` — per-mode Tracks event
  name + props. Names live in the config so a code search for
  `calypso_reader_<protocol>_<mode>_*` finds them; do not lift this
  into a shared helper.
- `overflowHandoff.{shown, editorOpened}` — optional Tracks events
  for the in-modal "Publish on your own site" escape hatch. `shown`
  fires once per modal session when the handoff section first renders
  (i.e. after the user crosses the limit AND the sites query resolves
  with ≥1 site). `editorOpened` fires on Move-to-editor click with
  `{ siteId }` — analogous to Reader's Quick Post
  `calypso_reader_quick_post_full_editor_opened`. Configs that omit
  this field don't emit overflow-handoff Tracks events. Atmosphere
  and Mastodon both wire it as `calypso_reader_<protocol>_overflow_handoff_{shown,editor_opened}`
  with `connection_id` + `mode_kind` props (plus `site_id` on the
  click event).
- `copy.{title, placeholder}` — per-mode strings.
- `logBadRequest?` — fire-and-forget hook for the `bad_request` body
  log. Lives in the per-protocol adapter so `calypso/lib/logstash`
  doesn't have to be imported from `packages/api-queries` (which is
  lint-restricted, same rule as the like/repost trackError logging).
- `useMedia?` — optional hook supplying a `ComposerMediaSlot`
  (`hasAny`/`hasUploaded`/`isAllUploaded`/`isAnyPending` flags +
  `renderGrid`/`renderFooterTrigger` slots + `extendBuildParams` /
  `onPublishSuccess` hooks). The hook MUST be a stable reference — it's
  invoked unconditionally inside the provider so React's hook-ordering
  rules apply. Atmosphere supplies `useAtmosphereComposerMedia`; Mastodon
  supplies `useMastodonComposerMedia` (CM-676). The shared `<MediaGrid>`
  and `<AltTextPopover>` live in `client/reader/social/composer-media/`;
  per-protocol shells (`client/reader/<protocol>/composer-media/`) own
  upload/state and pass predicates to the shared grid at the call site.
  Atmosphere's protocol-local `image-grid.tsx` was removed in CM-676 in
  favor of the shared predicate-based `<MediaGrid>`.

Reply-button gate at the post card: `<PostCardCounts>` always renders
the reply trigger when `analytics.onReplyClick` is set — there is no
secondary `post.cid` gate at the count cell. ATmosphere's `onReplyClick`
implementation in the panel guards on `! post.cid` itself; Mastodon's
posts never carry a `cid`, so a count-cell `&& post.cid` gate would
have dark-shipped the reply button on every Mastodon card. Future
protocols follow the atmosphere pattern: guard at the panel-level
handler, not at the cell.

Known dead field: `ComposerMode['reply'].root` is required by the
discriminated union but unused on Mastodon (the wire only consumes
`parent.uri` → `in_reply_to_id`). Mastodon panels currently set
`root: { uri: post.uri }` to satisfy types; a follow-up will make
`root` optional or per-protocol. Do not paste this dead field through
to a third protocol — wait for the union refactor.

The connection ID flows from the protocol shell:
`AccountView` → `<ComposerProvider connectionId={id} config={…}>` →
`<ComposerModal />` + `<ComposeFab />` (mounted as siblings of the
view content). Inline pills (`<TimelineComposePill />`) live inside
panels that opt into the composer via `useOptionalComposer()`.

## Boundaries (for new code)

Inherits everything from `client/reader/AGENTS.md` and `client/AGENTS.md`. Highlights worth restating because they trip up new contributors:

- TypeScript only (`.tsx`), strict, no `any` unless justified.
- Functional components only. Named exports — no default exports. Don't export prop types; consumers use `React.ComponentProps<typeof Component>`.
- `useSelector`/`useDispatch` hooks — no `connect()` HOC.
- `useTranslate()` from `i18n-calypso` — no `localize` HOC.
- `@wordpress/components` primitives over custom HTML. `VStack` / `HStack` / `Card` / `CardBody` / `Spinner` for layout. No `@automattic/components` (deprecated).
- `clsx` (not `classnames`).
- Per-component `style.scss`. Imported with one blank line between `import './style.scss'` and other imports.
- CSS logical properties (`margin-inline-start`, not `margin-left`). No BEM `&--` / `&__` shortcuts.
- Preserve curly quotes (' ' " ") exactly as authored. See the project `CLAUDE.md` for the safe-Edit pattern when curly quotes coexist with straight quote string delimiters.

## Tests

- `userEvent.setup()` + `user.click()` (not `fireEvent`).
- ARIA queries (`getByRole`, `getByLabelText`). No CSS selectors. No `data-testid` unless absolutely unavoidable.
- `renderWithProvider` from `calypso/test-helpers/testing-library` for components needing Redux + React Query.
- `nock` for HTTP mocking. Never mock components that contain real behaviour.
- DOMPurify allow-list tests: assert preserved tags, stripped tags, stripped attributes, stripped `javascript:` URLs, that `data-id` survives, that arbitrary `data-*` attributes (e.g. `data-tracking`) are stripped, and the unconditional rel + target hardening hook (every surviving `<a>` gains `target="_blank"` and the merged `rel="nofollow noopener noreferrer"`, with pre-existing rel tokens preserved).
- For the card-link pattern, test the surface map: timestamp-as-real-`<a>`, author chip click target, quote click target (the quote wrapper is a `<div>` and the inner timestamp anchor is the card-link target — verify there are no nested anchors), external click target, body inline link click target (assert it does not fire `_post_clicked`), card-background click via overlay, and that all anchors carry `target="_blank" rel="noopener noreferrer"` (body anchors additionally carry `nofollow`).

Run tests with:

```bash
yarn test-client client/reader/social
yarn test-client:watch client/reader/social
```

## Adding a new protocol

When wiring up a second (Mastodon) or third social protocol, expect to:

1. **Add a per-protocol shell** under `client/reader/<protocol>/` (e.g. `client/reader/mastodon/`) — routes, controller, account view, panels (timeline / profile / settings).
2. **Add per-protocol fetchers + types + hooks** under `packages/api-core/src/reader-<protocol>/` and `packages/api-queries/src/reader-<protocol>.ts`. Mirror the ATmosphere shape: typed fetchers, error classifier, query keys, infinite-query factory + hook.
3. **Reuse this directory's protocol-agnostic primitives directly:** `SocialProfileCard`, `SocialFeedList`, `PostCardLink`, `sanitizePostHtml`, `SocialAnalyticsProvider`. Don't duplicate.
4. **Decide on the post card.** Either refactor `SocialPostCard` and the embed dispatcher to take a `SocialPost` shape with a Bluesky→`SocialPost` mapper and a Mastodon→`SocialPost` mapper, or fork into `BlueskyPostCard` / `MastodonPostCard` keeping shared subcomponents (`PostCardLink`, `PostCardCounts`, etc.). Pick after looking at concrete fixtures, not before.
5. **Wire the analytics provider** in the protocol shell. Pass `source: '<protocol>'`, the connection id, and an `onClick` callback that dispatches `calypso_reader_<protocol>_*` Tracks events via `recordReaderTracksEvent`.
6. **Re-use the empty / error vocabulary** in `feed-list-empty.tsx` if the new protocol's error classifier produces the same kinds (`auth_required`, `rate_limited`, `upstream_unavailable`, `not_found`, `unknown`). Extend the dispatch only if a new kind appears.
7. **Wire the like / repost adapters** in the protocol shell: `make<Use…>LikeAction(connectionId)` + `make<Use…>RepostAction(connectionId)`, mounted via `<LikeProvider>` / `<RepostProvider>` on every panel that renders post cards. See "Like / Favourite interactions" and "Repost / Boost interactions" above.
8. **Wire the composer** by exporting a `ComposerConfig<TError, TParams, TResult>` from `client/reader/<protocol>/composer-config.tsx` and mounting `<ComposerProvider connectionId={…} config={…}>` + `<ComposerModal />` + `<ComposeFab />` on every view (account, thread, author-profile). Inline pills (`<TimelineComposePill />`) live inside panels that opt into the composer via `useOptionalComposer()`. See "Composer (slice 7)" above.

Future-extraction candidates flagged for later PRs (currently in `client/reader/atmosphere/`, expected to move shared-side once Mastodon needs them):

- `connect-form.tsx` — likely shareable with Mastodon's connect flow.
- `profile-panel.tsx` (your-own-connection profile) — already uses `SocialProfileCard` (rich variant); the panel shell could move shared-side once Mastodon's profile shape is fully aligned.
- `atmosphere-navigation.tsx` — the Timeline / Profile / Settings tab structure likely ports.

`author-profile-panel.tsx` was extracted to this directory as
`SocialAuthorProfilePanel` in slice 6 — both protocols already wrap the
shared component.

## References

- Reader-wide guidance: [`client/reader/AGENTS.md`](../AGENTS.md).
- Calypso-wide guidance: [`client/AGENTS.md`](../../AGENTS.md).
- Slice 6 design (in-app author profile): `~/notes/1-Projects/code/a8c/calypso/2026-04-28-reader-atmosphere-slice6-design.md`.
- Slice 6 plan: `~/notes/1-Projects/code/a8c/calypso/2026-04-28-reader-atmosphere-slice6-plan.md`.
- Slice 5 design (in-app thread view): `~/notes/1-Projects/code/a8c/calypso/2026-04-28-reader-atmosphere-slice5-design.md`.
- Slice 5 plan: `~/notes/1-Projects/code/a8c/calypso/2026-04-28-reader-atmosphere-slice5-plan.md`.
- Slice 4 design (Bluesky timeline frontend): `~/notes/1-Projects/code/a8c/calypso/2026-04-27-reader-atmosphere-slice4-frontend-design.md`.
- Slice 4 plan (task-by-task): `~/notes/1-Projects/code/a8c/calypso/2026-04-27-reader-atmosphere-slice4-frontend-plan.md`.
- Slice 1 (connections + profile): `~/notes/1-Projects/code/a8c/calypso/2026-04-22-reader-atmosphere-slice1-design.md` and `…-plan.md`.
- ATmosphere shell consuming this directory: [`client/reader/atmosphere/`](../atmosphere/).
- Public barrel — only import from here: [`./index.ts`](./index.ts).
