# Posts to Podcast — Calypso Port (Design)

## Context

Jetpack PR [#48523](https://github.com/Automattic/jetpack/pull/48523) wires up a Phase A "Posts to Podcast" admin page in the Jetpack plugin: a vanilla form (window / length / voice) that POSTs to a local `wpcom/v2/posts-to-podcast` proxy, which forwards via `Connection\Client::wpcom_json_api_request_as_user` to the wpcom-side endpoint at `/sites/{blog_id}/posts-to-podcast`. The wpcom endpoint enqueues an async job; on completion it returns a `postId`/`editUrl` for a draft post containing the generated markdown script.

This design moves the user-facing surface to Calypso. The Jetpack-side proxy is unnecessary on `wordpress.com` because Calypso talks to `public-api.wordpress.com` directly via `wpcom.js`. Phase A is internal a8c-only; the wpcom endpoint enforces `is_automattician()` server-side.

## Placement and gating

No new route. A new section is added to the existing `/settings/podcasting/:site_id` page at `client/my-sites/site-settings/podcasting-details/index.jsx`. It renders only when:

- The current user is an Automattic team member, checked via `isAutomatticTeamMember(teams)` from `calypso/reader/lib/teams`, with `teams` fetched by `useQuery( readTeamsQuery() )` from `@automattic/api-queries`. While the teams query is loading, the section is hidden (no flash).
- Podcasting is enabled on the site (`podcastingCategoryId > 0`).

The wpcom endpoint's `is_automattician()` check is the authoritative gate; the client check is purely cosmetic.

## Component structure

New folder `client/my-sites/site-settings/podcasting-details/posts-to-podcast/`:

- `index.jsx` — `<PostsToPodcastSection>`, rendered from `podcasting-details/index.jsx` after the "Feed settings" `Card`, inside the `isPodcastingEnabled && isAutomatticTeamMember(teams)` branch.
- `use-posts-to-podcast.js` — hook encapsulating the state machine (`idle | polling | succeeded | failed`), returning `{ status, jobId, result, error, generate, reset }`.
- `presets.js` — `WINDOW_PRESETS`, `LENGTH_PRESETS`, `VOICE_PRESETS`. Same `id`/`label` shape as the Jetpack helper. `WINDOW_PRESETS` entries also carry `{ unit, n }` for the request body.
- `style.scss` — minimal; only what `@wordpress/components` and the surrounding podcasting styles don't already cover.
- `test/use-posts-to-podcast.test.js`, `test/index.test.jsx`.

## API client and data flow

Direct `wpcom.js` calls, no Redux data-layer handler, no `@automattic/api-queries` addition:

```js
import wpcom from 'calypso/lib/wp';

// Enqueue
const { jobId } = await wpcom.req.post(
    {
        path: `/sites/${ siteId }/posts-to-podcast`,
        apiNamespace: 'wpcom/v2',
    },
    {
        window,        // { unit: 'days' | 'months', n: number }
        length,        // 'short' | 'medium' | 'long'
        voicePreset,   // 'witty' | 'earnest' | 'professional'
    }
);

// Poll
const record = await wpcom.req.get( {
    path: `/sites/${ siteId }/posts-to-podcast/jobs/${ jobId }`,
    apiNamespace: 'wpcom/v2',
} );
// record: { status: 'pending' | 'complete' | 'failed' | 'unknown', postId?, editUrl?, message?, errorMessage?, errorCode? }
```

Polling cadence mirrors Phase A: 3s for the first 30s of real elapsed time (`Date.now() - startedAt`), then 10s, with a 5-minute total timeout. Hand-rolled in the hook with `setTimeout`; cleaned up on terminal state and unmount.

Error handling: `wpcom.req` rejections (network, 4xx, 5xx) and terminal `failed` records both surface a `<Notice status="is-error">` with the upstream message when available, falling back to the generic copy from Phase A.

## Persisting in-progress jobs across navigation

Jobs take 2–3 minutes; users will navigate away. We persist the active jobId in `localStorage` keyed by site.

- **Key:** `posts-to-podcast:active-job:<siteId>`.
- **Value:** `{ jobId, startedAt }` (ms since epoch).
- **On `generate()` success:** write the entry, transition to `polling`.
- **On `<PostsToPodcastSection>` mount:** read the entry for the current `siteId`. If present and `Date.now() - startedAt < 5 min`, transition straight into `polling` and start the timer. If older, clear it and stay `idle`.
- **On terminal state or timeout:** clear the entry.
- **SSR safety:** guard `typeof window !== 'undefined'` before touching `localStorage`.

The wpcom endpoint only exposes `POST` and `GET /jobs/{id}` — there is no "list active jobs" endpoint, which is why we keep state client-side. A server-side list endpoint would be a clean Phase B improvement (cross-device resumption) but is out of scope here.

## UI

A `Card` under a `SettingsSectionHeader` (title: "Generate episode from recent posts") placed after the "Feed settings" `Card`. No save button on the header — generation is the action.

- Three `FormSelect` controls (Window / Length / Voice) using the existing `FormFieldset` + `FormLabel` + `FormSettingExplanation` primitives.
- `Button` ("Generate" / "Generating…"), disabled while `status === 'polling'`. The selects are also disabled during polling.
- Status region below the button:
  - `polling`: `<Notice status="is-info" showDismiss={ false }>` "Generating episode script — this usually takes 2–3 minutes. You can leave this page and come back."
  - `succeeded`: `<Notice status="is-success">` "Draft created." with a primary `Button` linking to `/post/${ siteSlug }/${ postId }` (Calypso editor) and a secondary link to `/posts/drafts/${ siteSlug }`.
  - `failed`: `<Notice status="is-error">` with the upstream message or generic fallback.
- All strings via `useTranslate()`. Match Phase A copy: "Witty / Earnest / Professional", "Short (~3 min) / Medium (~7 min) / Long (~12 min)", "Last 7 days / 14 days / 30 days / 3 months".

## Testing

Under `posts-to-podcast/test/`:

- **`use-posts-to-podcast.test.js`** — `renderHook` from `@testing-library/react`, `jest.useFakeTimers()`, `nock` for `wpcom.req`. Covers: happy path; cadence switch at 30s; resume-from-localStorage (90s-old entry → `polling` with no POST, 10s cadence); expired-entry cleanup; enqueue rejection; poll rejection; terminal `failed`; 5-min timeout; unmount during polling clears the timer.
- **`index.test.jsx`** — `renderWithProvider` from `calypso/test-helpers/testing-library`. Mock `readTeamsQuery`. Use `userEvent` + ARIA queries. Covers: hidden while teams loading; hidden when not in a8c team; hidden when podcasting disabled; happy path with link to `/post/<slug>/<id>`; error path re-enables Generate.

Existing `podcasting-details/index.jsx` ships without tests; we don't add coverage for it as part of this work — only for new code.

## Out of scope

- Server-side list endpoint for active jobs (Phase B).
- Real entitlement / Jetpack AI credits gating (Phase C on the Jetpack side; Calypso will follow the same rollout).
- Replacing or removing the Jetpack admin page from PR #48523 — the surfaces can coexist while Phase A is internal.
- Any change to `@automattic/api-queries` — direct `wpcom.req` is sufficient for this internal feature; lifting into a query factory is a follow-up if the surface graduates.
