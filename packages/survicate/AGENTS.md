# @automattic/survicate

Thin integration layer around [Survicate](https://survicate.com/), the third-party
survey SDK used to run in-product surveys on WordPress.com surfaces. This package
loads the SDK, sets visitor traits, fires events, and — importantly — keeps surveys
from interrupting users who are in the Help Center.

## What this package does (and doesn't)

- **Does**: decide whether to load Survicate, inject the SDK script, set visitor
  traits, invoke named events, and suppress/close surveys when the Help Center is open.
- **Doesn't**: define survey content, targeting, or campaign rules. Those live in the
  Survicate dashboard (workspace `e4794374cce15378101b63de24117572`). We only control
  the SDK lifecycle on our side.

## The Survicate SDK (`window._sva`)

Once the SDK script loads, it exposes a global `window._sva` object and dispatches a
one-time `SurvicateReady` event on `window`. The global type is declared once in
`visitor-traits.ts` (`declare global { interface Window { _sva?: {...} } }`) and is
visible package-wide. The methods we use:

- `invokeEvent(name)` — trigger an event-based survey.
- `closeSurvey()` — dismiss any currently displayed survey.
- `setVisitorTraits(traits)` — attach traits (user ID, email, account age) used for targeting.
- `addEventListener(event, handler)` / `removeEventListener` — subscribe to SDK events
  such as `survey_displayed`.
- `destroyVisitor()` — reset the visitor.

`_sva` is `undefined` until the script finishes loading, so **every access must be
guarded** (`window._sva?.method`). Code may also run before `SurvicateReady` fires.

## The two ways a survey can appear

This is the key mental model. Surveys reach the screen through two independent paths,
and each needs its own guard:

1. **Explicit events** — our code calls `invokeSurvicateEvent('migrationCompleted')`
   etc. from ~6 call sites (purchase cancel/refund flows, migration completion,
   checkout thank-you). Guarded inside `invoke-event.ts`.
2. **Auto-campaigns** — Survicate's own targeting fires a survey on its own (URL match,
   "show after N seconds", etc.). This **never touches our code**, so an invoke-time
   guard can't catch it. The only universal hook is the SDK's `survey_displayed` event.

## Visit-count traits (area-based survey targeting)

To show a survey only after a user has visited a dashboard area at least X times
(reducing survey overload and giving users enough exposure to answer), the MSD
publishes a per-area visit count as a numeric visitor trait. The "≥ X" threshold
is configured **per survey in the Survicate dashboard**, not in code — so it's
tunable without a deploy, and multi-area audiences (`msd_visits_a >= 3 AND
msd_visits_b >= 3`) need no code change.

- **Registry / resolver**: `client/dashboard/app/survicate/visit-areas.ts` —
  `VISIT_AREAS` maps each area slug to its `msd_visits_<slug>` trait;
  `resolveVisitAreaSlug( pathname )` maps a route to its area (deepest match
  wins, so overlaps like `logs/activity` resolve correctly). Add an area by
  adding a registry entry and a resolver case — nothing else changes.
- **Counting**: `client/dashboard/app/hooks/use-visit-counter.ts` —
  `useTrackVisitedAreas()` (mounted once in the root route component) increments
  the current area's counter at most once per calendar day, persisted to the
  `hosting-dashboard-visit-count-<slug>` user preference. Gated on
  `survicate_enabled`.
- **Publishing**: `useSurvicateVisitTraits()` in
  `client/dashboard/app/survicate/index.tsx` (mounted in the layout) reads those
  preferences and pushes `{ msd_visits_<slug>: count }` via
  `setSurvicateVisitorTraits`, re-pushing when counts change. Incrementing and
  publishing are deliberately decoupled — they share only the preference store.

`setSurvicateVisitorTraits` accepts an arbitrary `Record<string, string | number>`,
so any trait (email, account age, visit counts) flows through the same
deferred-until-`SurvicateReady` path.

### Two separate trait pushes are expected

Visitor traits are published from **two** independent `setSurvicateVisitorTraits`
call sites, and this is intentional — don't consolidate them into one:

- `useSurvicate` pushes **identity** traits (`user_id`, `email`,
  `account_age_in_days`) once from the authenticated user, right after the script
  loads, next to the
  `calypso_survicate_user_not_available_error` tracks event that fires when the
  email is missing at load time.
- `useSurvicateVisitTraits` pushes **behavioral** traits (`msd_visits_<slug>`)
  reactively, re-pushing whenever a preference-backed visit count changes.

They have different sources and lifecycles (set-once identity vs. reactive
counts), so keeping them apart keeps each concern where it belongs. This is safe
because `_sva.setVisitorTraits` **merges** traits across calls (upsert), rather
than replacing the whole set — so the visit-count push does not clobber the
email/account-age traits, and vice versa.

## Modal & Help Center coordination (defense-in-depth)

Surveys must not cover the Help Center while a user is actively seeking support, nor
draw over any other open modal dialog (onboarding modals, WP `Modal`, native
`<dialog>`). The umbrella check is `shouldSuppressSurvey()` (`invoke-event.ts`):
`isHelpCenterOpen() || isModalOpen()`. The touch points — keep all of them:

1. **Open HC while a survey is showing** → `packages/data-stores/src/help-center/actions.ts`
   (`setShowHelpCenter`) calls `window._sva?.closeSurvey?.()` on open. (Note: that file
   intentionally inlines the call rather than importing this package — data-stores is a
   lower-level shared package and must not depend on `@automattic/survicate`.)
2. **Invoke an event while HC/a modal is open** → `invoke-event.ts` checks
   `shouldSuppressSurvey()` and skips the trigger (both immediately and deferred at
   `SurvicateReady` time).
3. **Any survey displays while HC/a modal is open** → `load-script.ts` subscribes to
   `survey_displayed` and closes it. This is the comprehensive net that also catches
   auto-campaigns (path 2 above).
4. **A modal opens while a survey is showing** → `load-script.ts` starts
   `observeModals()`, which closes the survey (and records the suppression when a
   survey was actually visible). Both this observer and the
   `survey_displayed` listener are torn down via the optional `AbortSignal`
   passed to `loadSurvicateScript` — `useSurvicate` passes its effect's signal,
   so repeated loads don't accumulate observers. Because `SurvicateReady` fires
   only once per page, the wiring runs immediately when the SDK is already
   loaded (a consumer effect re-running after an earlier abort) and otherwise
   waits for `SurvicateReady`; this re-establishes suppression on re-mount
   instead of dropping it permanently. Without a signal it lives for the page
   lifetime.

`isHelpCenterOpen()` (exported from `invoke-event.ts`) reads the `automattic/help-center`
`@wordpress/data` store by string and returns `false` if the store isn't registered, so
it's safe to call even when the Help Center isn't loaded on the surface. It is kept
separate from DOM detection on purpose: the Help Center is a side panel without
`aria-modal`, so the store is the reliable signal for it.

### Modal detection (`modal-detection.ts`)

- `MODAL_SELECTOR` matches `[role="dialog"][aria-modal="true"]` (requiring
  `aria-modal` excludes generic `role="dialog"` widgets), native `dialog[open]`,
  `.components-modal__screen-overlay` (older WP `Modal` versions), and
  `.components-popover:not(.components-tooltip)` (WP `Popover`; `Tooltip` reuses
  the popover class and must not suppress surveys on every hover).
- **Self-exclusion is load-bearing**: the Survicate widget itself renders
  `role="dialog"`/`aria-modal="true"` elements inside
  `<div id="survicate-box" class="survicate-box-<type>">` (verified in
  `widget_core-28.33.0.js`). Candidates inside
  `#survicate-box, [class*="survicate-box"]` are skipped — otherwise every survey
  would close itself on display.
- `isModalOpen()` also requires the candidate to be rendered, preferring
  `Element.checkVisibility()` with a `getClientRects()` fallback. Called with no
  options, `checkVisibility()` only treats `display: none`, `content-visibility`,
  and detached nodes as not-rendered — **not** `visibility: hidden` or
  `opacity: 0` — so this guards the common "mounted but `display: none`" dialog,
  not every hidden-but-mounted one. In practice WP `Modal` / native `dialog`
  fully unmount on close, so the residual cases don't arise. jsdom implements no
  layout (`getClientRects()` is always empty), so tests stub `checkVisibility`
  per element.
- `observeModals( onOpen, onAllClosed? )` watches `document.body` for **added and
  removed nodes only** (no attribute observation — a native `<dialog>` toggled via
  `open` in place is missed, but the `survey_displayed` net still covers it).
  `onAllClosed` fires when a batch removes a modal and `isModalOpen()` is then
  false. Returns a disconnect function.
- Everything fails **open**: any error in detection means "no modal", so surveys
  behave as they did before this module existed.

### Targeting pause/resume (`targeting.ts`)

**Closing a suppressed auto-campaign survey is not enough.** The SDK's targeting
engine re-evaluates every few seconds and re-displays a closed survey while its
campaign still matches, producing an endless display→close loop (and a stream of
`targeting`/`seen.json`/`survey_interactions` requests). The fix uses two SDK
affordances verified in `widget_core-28.33.0.js`:

- `window._sva.disableTargeting` is read **live** by the targeting engine: while
  truthy, only API-triggered surveys stay eligible; auto-campaigns are not
  scheduled at all.
- `window._sva.retarget()` (public) re-runs the targeting evaluation.

`pauseSurvicateTargeting()` sets the flag; `resumeSurvicateTargeting()` clears it
and calls `retarget()` (no-op unless paused). `load-script.ts` pauses when a
modal opens (`observeModals` `onOpen`), when a survey displays with a modal open
(`reason === 'modal'`), and up front at wire time if a modal is already open —
that last one means a modal shown before the SDK loads produces **no flash at
all**. It resumes via `observeModals` `onAllClosed` and on consumer abort (so a
torn-down consumer never leaves the SDK paused). The Help Center reason
deliberately does **not** pause: it has no close hook here to resume from, and
keeps its long-standing close-on-display behavior.

### Measuring suppression (`track-suppression.ts`)

Every suppression records a `calypso_survicate_survey_suppressed` Tracks event
(`recordSurveySuppressed`), so we can measure how often surveys are suppressed —
and in particular how many the modal rule catches versus the older Help Center
rule. Properties:

- `reason` — `modal` or `help_center`. `getSuppressionReason()` checks the Help
  Center first, so `reason: 'modal'` fires only when a modal is the **sole**
  reason; filtering on it measures the incremental effect of the modal rule.
- `trigger` — `survey_displayed` (a survey rendered and was closed — the
  auto-campaign case), `modal_opened` (a modal opened over a survey already on
  screen; gated on `isSurveyVisible()` so it doesn't fire on every modal open),
  or `invoke_event` (an explicit `invokeSurvicateEvent()` was skipped, plus an
  `event_name` property).

Recording is best-effort and wrapped in `try/catch` — a failing analytics call
never interferes with suppression. The wp-admin loader (PHP) uses its own
analytics path and does not emit this event yet.

The wp-admin loader (`jetpack-mu-wpcom/src/features/survicate/class-survicate.php`,
Jetpack monorepo) inlines the same logic in its emitted script; keep the two in sync
when changing selectors or behavior.

**Known caveat — the display flash**: `survey_displayed` fires _after_ the survey
renders, so closing it produces a brief show-then-hide flicker. The SDK exposes no
pre-display veto. For modals this is largely mitigated by the targeting pause
(`targeting.ts`): a modal open before the SDK is ready, or opened while it is
paused, prevents display entirely; the flash remains only for the race where a
survey is already mid-display as a modal appears, and for the Help Center rule,
which doesn't pause.

## File map

- `conditions.ts` — `shouldLoadSurvicate({ locale, isMobile })` (English, non-mobile
  only) and `SURVICATE_WORKSPACE_ID`.
- `load-script.ts` — `loadSurvicateScript()` injects the SDK and wires the
  `survey_displayed` safety net; `isSurvicateScriptLoaded()`.
- `invoke-event.ts` — `invokeSurvicateEvent()`, `isHelpCenterOpen()`,
  `getSuppressionReason()`, and `shouldSuppressSurvey()`.
- `modal-detection.ts` — `isModalOpen()`, `isSurveyVisible()`, `observeModals()`,
  `MODAL_SELECTOR`.
- `targeting.ts` — `pauseSurvicateTargeting()` / `resumeSurvicateTargeting()`:
  gate the SDK's auto-campaign targeting via the `disableTargeting` flag.
- `track-suppression.ts` — `recordSurveySuppressed()`: the
  `calypso_survicate_survey_suppressed` Tracks event.
- `close-survey.ts` — `closeSurvicateSurvey()`: the single, guarded `_sva.closeSurvey()`
  helper reused by the suppression call sites.
- `visitor-traits.ts` — `setSurvicateVisitorTraits()`, `getAccountAgeInDays()`, and the
  global `window._sva` type declaration.
- `index.ts` — public exports.

## Consumers

The package's entry point is `client/dashboard/app/survicate/index.tsx` (`useSurvicate`
hook), gated behind the `survicate_enabled` config flag. `invokeSurvicateEvent` is also
called from classic Calypso purchase/cancel and checkout flows.

## Conventions & gotchas

- **Always guard `window._sva`** — it's `undefined` until the SDK loads.
- **Use `closeSurvicateSurvey()`** rather than re-inlining `window._sva?.closeSurvey?.()`
  inside this package.
- **Listeners that wait for `SurvicateReady`** should use `{ once: true }`. Note the
  event fires only once per page load — code that registers a `SurvicateReady` listener
  _after_ the SDK already loaded will never run, so register at load time.
- Each `src/*.ts` file has a matching `src/test/*.test.ts`. Tests use
  `@jest-environment jsdom`, mock `@wordpress/data`'s `select`, and stub `window._sva`.
- Tab indentation, tabs for alignment (match existing files).

## Commands

```bash
yarn test-packages packages/survicate          # run all package tests
cd packages/survicate && npx tsc --build ./tsconfig.json   # typecheck
yarn eslint packages/survicate/src/<file>       # lint
```
