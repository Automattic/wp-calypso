# Reader Social

Shared UI primitives for Reader's third-party social-network surfaces: Bluesky / ATProto (shipping under the user-facing label "ATmosphere") today, Mastodon next, additional protocols later.

This directory is a **components-only** package. It owns no routes, no controllers, no Redux state, and no top-level pages. The protocol-specific shells live next to it (e.g. `client/reader/atmosphere/`, future `client/reader/mastodon/`) and import from here.

## Scope

In scope:

- Presentational React components rendered by per-protocol shells (profile cards, feed lists, post cards, post-card subcomponents).
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
  style.scss                    # SocialProfileCard styles
  test/
    profile-card.test.tsx

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
      post-card-counts.tsx      # replies / reposts / likes / quotes row
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
```

## Architectural decisions

### Bluesky-shaped types today, abstract when Mastodon arrives

`SocialPostCard` and the embed dispatcher take `AtmosphereFeedItem` from `@automattic/api-core` directly — there is no protocol-agnostic `SocialPost` shape yet. This is deliberate: a generic shape designed against one protocol is just that protocol's shape with extra layers, and Mastodon's data model (`content` vs `html`, `media_attachments` vs `embed`, `reblog` vs `reason`, no native quotes) is non-trivially different.

When Mastodon's shape is concretely in front of us, decide between:

- **Refactor in place** — introduce a `SocialPost` shape with per-protocol mappers, if Bluesky and Mastodon overlap cleanly enough.
- **Fork** — `BlueskyPostCard` / `MastodonPostCard` siblings sharing only the truly-protocol-agnostic bits below.

Don't speculate ahead of that signal. Adding a generic shape now will make the abstraction wrong in a way only the second protocol can reveal.

### What's already protocol-agnostic (reuse as-is for Mastodon)

- `SocialProfileCard` — generic over a `stats[]` array; accepts plain-text `bio` or sanitised `bioHtml`. Already used by ATmosphere and intended for Mastodon.
- `SocialFeedList<T>` — generic over item type via `renderItem` and `itemKey`. Mastodon plugs in a different data hook and a different `renderItem` callback; the list shell, sentinel-based pagination, skeleton, and error variants don't change.
- `PostCardLink` — the card-link accessibility pattern (one real `<a>` + `::after` overlay + nested `position: relative; z-index: 1` anchors).
- `sanitizePostHtml` — DOMPurify wrapper with allow-list (`<p> <br> <a>` / `href, rel, target`) and the `target="_blank"` rel-hardening hook. Conservative enough for Mastodon content too, possibly with a small extension to that allow-list once we see what Mastodon emits.
- `SocialAnalyticsProvider` / `useSocialAnalytics` — the per-protocol shell wraps its tree with a `source` ('atmosphere' | 'mastodon' | …) + `connectionId` + `onClick(event, props)` callback. The post-card subcomponents call into this context instead of dispatching `recordReaderTracksEvent` directly. Adding a protocol just means adding a `source` value and wiring up the protocol's per-event Tracks call in the shell.

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

### HTML sanitisation (defence-in-depth)

Every place this directory injects HTML from a third-party network — `SocialProfileCard` for bios, `PostCardBody` for post content — runs the input through DOMPurify with a tight allow-list **before** handing it to React's HTML-injection prop. The backend already runs `wp_kses` over the same content with a matching allow-list, but the client double-sanitises so a future backend change can't silently widen what reaches the DOM.

Allow-list shape:

- `ALLOWED_TAGS: ['p', 'br', 'a']` for post content (extend cautiously for new protocols).
- `ALLOWED_TAGS: ['p', 'br', 'a', 'span']` for profile bios (Mastodon emits `<span>` mention scaffolding).
- `ALLOWED_ATTR` capped to `href`, `rel`, `target`, `class` (bio only).
- DOMPurify's default scheme allow-list strips `javascript:` / `data:` / etc. on `href`. Don't extend it.
- An `afterSanitizeAttributes` hook forces `rel="nofollow noopener noreferrer"` on any `<a target="_blank">` that survives sanitisation. Belt-and-suspenders against window-opener leaks if upstream ever drops the rel attribute.

### Card-link accessibility pattern

`PostCardLink` implements [Inclusive Components' card-link pattern](https://inclusive-components.design/cards/):

- Exactly one real `<a>` per card (the post timestamp), with a `::after` pseudo-element covering the whole card as the click target.
- Inner clickable elements (author chip, external embed, quote embed) are `position: relative; z-index: 1` so they sit above the overlay and remain individually clickable.
- Card text remains selectable (the overlay sits behind text via `z-index`-stacking, not in front of it).

Don't replace this with a `<a>`-wrapping-the-whole-card structure (illegal nested anchors) or `onClick` on a `<div>` (kills keyboard navigation and screen-reader semantics).

### Click destinations

Today every click destination opens `bsky.app` in a new tab (`target="_blank" rel="noopener noreferrer"`). Slice 5 will rewrite three of those (parent post → in-app thread route, quote → in-app thread route, author → in-app profile route) without touching the card-link plumbing itself. When wiring a new card surface, route through `PostCardLink` rather than spreading `target="_blank"` anchors directly across subcomponents.

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
- DOMPurify allow-list tests: assert preserved tags, stripped tags, stripped attributes, stripped `javascript:` URLs, and the `target="_blank"` rel-hardening hook.
- For the card-link pattern, test the surface map: timestamp-as-real-`<a>`, author chip click target, quote click target, external click target, card-background click via overlay, and that all anchors carry `target="_blank" rel="noopener noreferrer"`.

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

Future-extraction candidates flagged for later PRs (currently in `client/reader/atmosphere/`, expected to move shared-side once Mastodon needs them):

- `connect-form.tsx` — likely shareable with Mastodon's connect flow.
- `verify-panel.tsx` — already uses `SocialProfileCard`; the panel shell could move shared-side.
- `atmosphere-navigation.tsx` — the Timeline / Profile / Settings tab structure likely ports.

## References

- Reader-wide guidance: [`client/reader/AGENTS.md`](../AGENTS.md).
- Calypso-wide guidance: [`client/AGENTS.md`](../../AGENTS.md).
- Slice 4 design (Bluesky timeline frontend): `~/notes/1-Projects/code/a8c/calypso/2026-04-27-reader-atmosphere-slice4-frontend-design.md`.
- Slice 4 plan (task-by-task): `~/notes/1-Projects/code/a8c/calypso/2026-04-27-reader-atmosphere-slice4-frontend-plan.md`.
- Slice 1 (connections + profile): `~/notes/1-Projects/code/a8c/calypso/2026-04-22-reader-atmosphere-slice1-design.md` and `…-plan.md`.
- ATmosphere shell consuming this directory: [`client/reader/atmosphere/`](../atmosphere/).
- Public barrel — only import from here: [`./index.ts`](./index.ts).
