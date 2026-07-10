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
- `setVisitorTraits(traits)` — attach traits (email, account age) used for targeting.
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

- `useSurvicate` pushes **identity** traits (`email`, `account_age_in_days`) once
  from the authenticated user, right after the script loads, next to the
  `calypso_survicate_user_not_available_error` tracks event that fires when the
  email is missing at load time.
- `useSurvicateVisitTraits` pushes **behavioral** traits (`msd_visits_<slug>`)
  reactively, re-pushing whenever a preference-backed visit count changes.

They have different sources and lifecycles (set-once identity vs. reactive
counts), so keeping them apart keeps each concern where it belongs. This is safe
because `_sva.setVisitorTraits` **merges** traits across calls (upsert), rather
than replacing the whole set — so the visit-count push does not clobber the
email/account-age traits, and vice versa.

## Help Center coordination (defense-in-depth)

Surveys must not cover the Help Center while a user is actively seeking support. Three
complementary touch points enforce this — keep all three:

1. **Open HC while a survey is showing** → `packages/data-stores/src/help-center/actions.ts`
   (`setShowHelpCenter`) calls `window._sva?.closeSurvey?.()` on open. (Note: that file
   intentionally inlines the call rather than importing this package — data-stores is a
   lower-level shared package and must not depend on `@automattic/survicate`.)
2. **Invoke an event while HC is open** → `invoke-event.ts` checks `isHelpCenterOpen()`
   and skips the trigger (both immediately and deferred at `SurvicateReady` time).
3. **Any survey displays while HC is open** → `load-script.ts` subscribes to
   `survey_displayed` and closes it. This is the comprehensive net that also catches
   auto-campaigns (path 2 above).

`isHelpCenterOpen()` (exported from `invoke-event.ts`) reads the `automattic/help-center`
`@wordpress/data` store by string and returns `false` if the store isn't registered, so
it's safe to call even when the Help Center isn't loaded on the surface.

**Known caveat — the display flash**: `survey_displayed` fires *after* the survey
renders, so closing it produces a brief show-then-hide flicker for auto-campaigns. The
SDK exposes no pre-display veto. If the flash ever becomes a real problem, the
alternative is Survicate-side targeting (set a `help_center_open` visitor trait via
`setSurvicateVisitorTraits` and exclude it in campaign config) — more reliable but
requires dashboard coordination. Don't build that pre-emptively.

## File map

- `conditions.ts` — `shouldLoadSurvicate({ locale, isMobile })` (English, non-mobile
  only) and `SURVICATE_WORKSPACE_ID`.
- `load-script.ts` — `loadSurvicateScript()` injects the SDK and wires the
  `survey_displayed` safety net; `isSurvicateScriptLoaded()`.
- `invoke-event.ts` — `invokeSurvicateEvent()` and `isHelpCenterOpen()`.
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
  *after* the SDK already loaded will never run, so register at load time.
- Each `src/*.ts` file has a matching `src/test/*.test.ts`. Tests use
  `@jest-environment jsdom`, mock `@wordpress/data`'s `select`, and stub `window._sva`.
- Tab indentation, tabs for alignment (match existing files).

## Commands

```bash
yarn test-packages packages/survicate          # run all package tests
cd packages/survicate && npx tsc --build ./tsconfig.json   # typecheck
yarn eslint packages/survicate/src/<file>       # lint
```
