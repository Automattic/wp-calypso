# Survicate: suppress surveys while a modal is open

**Date:** 2026-08-28
**Status:** Design approved, not yet implemented

## Problem

Survicate surveys appear on top of modals the user is already interacting with.
Observed on the wp-admin Site Setup page: the "What's your main goal?" onboarding
modal and a "Tell us about your experience with WordPress.com" survey rendered at
the same time, for a user who had just created the site.

Today the only suppression rule, on every surface, is "the Help Center is open".
Anything else that is modal (WordPress `Modal`, native `<dialog>`, onboarding
dialogs, plugin dialogs) gets a survey drawn over it.

## Where Survicate is loaded

| Surface | Loader | Suppression today |
| --- | --- | --- |
| wp-admin (Simple + Atomic) | `jetpack-mu-wpcom/src/features/survicate/class-survicate.php` — inline script emitted from PHP (Jetpack monorepo) | Help Center: `wp.data.subscribe( 'automattic/help-center' )` on open, plus `survey_displayed` check |
| Calypso + Multi-site Dashboard | `packages/survicate` (this repo), consumed by `client/dashboard/app/survicate` and `client/lib/analytics/survicate` | Help Center: `isHelpCenterOpen()` in `invoke-event.ts` and the `survey_displayed` listener in `load-script.ts` |

The Survicate SDK exposes **no pre-display veto**. Auto-campaigns (URL / time
targeting configured in the Survicate dashboard) never touch our code, so the SDK's
`survey_displayed` event is the only universal hook. Closing there produces a brief
show-then-hide flash; that is already the accepted trade-off for the Help Center
rule and is unchanged here.

## Decisions

- **Scope:** both loaders — `packages/survicate` here and `class-survicate.php` in
  the Jetpack monorepo. Same design, two PRs.
- **Detection:** generic DOM detection. No per-modal opt-in, no Survicate-dashboard
  configuration. Rejected alternatives:
  - *Explicit registry* (each modal declares itself): precise but every modal must
    be touched and new ones get forgotten — this is how we ended up with a
    Help-Center-only rule.
  - *Visitor trait* (`modal_open`) excluded per campaign: the only option without a
    flash, but depends on every campaign being configured correctly, is async (the
    race remains), and is invisible in code review. Kept as a later escalation if
    the flash becomes a real complaint; not built now.
- **Behavior:** close and drop, in both directions. No re-show after the modal
  closes; Survicate's own recurrence rules will offer the survey on a later visit.
- **Help Center rule stays as-is.** It reads the `@wordpress/data` store, which is
  more reliable than DOM for a side panel that is not `aria-modal`, and it is
  already tested. The new condition is OR'd in.

## Design

### 1. Detection primitive

One pure function, duplicated in the two loaders (they are deliberately
self-contained: the wp-admin script is emitted from PHP with no bundler).

```
MODAL_SELECTOR =
  '[role="dialog"][aria-modal="true"], dialog[open], .components-modal__screen-overlay'

isModalOpen():
  for each el in document.querySelectorAll( MODAL_SELECTOR ):
    if el is inside Survicate's own container  → skip
    if el.getClientRects().length === 0        → skip   (mounted but not rendered)
    return true
  return false

shouldSuppressSurvey() = isHelpCenterOpen() || isModalOpen()
```

Why these selectors:

- `[role="dialog"][aria-modal="true"]` — `@wordpress/components` `Modal`,
  `@wordpress/ui` dialogs, and most a11y-correct modal libraries. Requiring
  `aria-modal` excludes popovers and tooltips that only set `role="dialog"`.
- `dialog[open]` — native `<dialog>`.
- `.components-modal__screen-overlay` — older WP `Modal` versions where
  `aria-modal` sat on an inner node.

The Survicate exclusion is essential: the SDK renders its own widget with dialog
semantics, so without it every survey would close itself on display. The real
container selector (`#survicate-box` or similar) is confirmed in a browser as the
first implementation step, not assumed.

### 2. Wiring — three touch points per surface

**A. Survey displays while something is open** (the reported case)
`SurvicateReady` → `_sva.addEventListener( 'survey_displayed', … )` →
if `shouldSuppressSurvey()` → `_sva.closeSurvey()`. Existing listener; only the
condition widens. Catches auto-campaigns.

**B. Modal opens while a survey is on screen**
One `MutationObserver` on `document.body` (`childList: true, subtree: true`). For
each batch, inspect only the *added* nodes: if one matches or contains
`MODAL_SELECTOR` (skipping the Survicate container) → `closeSurvey()`. Attributes
are not observed; a native `<dialog>` toggled via `open` without a DOM insertion
is the one miss, and it is still covered by A on the next survey display.
Registered once after `SurvicateReady`. Calypso: torn down by the existing
`AbortController` cleanup in `useSurvicate`. wp-admin: page lifetime, like the
current `wp.data.subscribe`.

**C. Explicit `invokeSurvicateEvent( name )` calls** (Calypso only)
Already short-circuits on `isHelpCenterOpen()` both immediately and in the deferred
`SurvicateReady` path. Swap to `shouldSuppressSurvey()`; behavior stays "skip and
return a no-op cleanup".

### 3. Files

This repo:

- `packages/survicate/src/modal-detection.ts` (new): `MODAL_SELECTOR`,
  `isModalOpen()`, `observeModals( onOpen ): () => void`.
- `packages/survicate/src/invoke-event.ts`: add `shouldSuppressSurvey()` beside
  `isHelpCenterOpen()`; use it in both guard sites.
- `packages/survicate/src/load-script.ts`: widen the `survey_displayed` condition;
  start the observer after `SurvicateReady`; return its cleanup so callers can
  disconnect it.
- `packages/survicate/AGENTS.md`: extend the "Help Center coordination" section
  into "Modal / Help Center coordination".

Jetpack monorepo:

- `projects/packages/jetpack-mu-wpcom/src/features/survicate/class-survicate.php`:
  the same three pieces inline in the emitted JS (`isModalOpen`, the observer, the
  widened `survey_displayed` check). Changelog entry.

### 4. Edge cases and failure modes

- Modal already open when the SDK finishes loading → A closes any survey that then
  displays (mirrors the "Help Center opened before SDK loaded" race already handled
  in wp-admin).
- Hidden-but-mounted dialogs (`display: none`) → excluded by the
  `getClientRects()` check, so they cannot suppress surveys forever on a page.
- The flash → unchanged from the Help Center rule; documented.
- All new code fails **open**: a throwing selector, a missing `MutationObserver`,
  or an observer error leaves behavior exactly as before this change. Every
  `window._sva` access stays guarded.

### 5. Testing

- `packages/survicate/src/test/modal-detection.test.ts` (jsdom): no modal → false;
  `role=dialog aria-modal=true` → true; `dialog[open]` → true; `role=dialog`
  without `aria-modal` → false; node inside the Survicate container → false;
  unrendered node → false; observer fires on modal insertion, not on plain `div`s;
  cleanup disconnects.
- Extend `load-script.test.ts` and `invoke-event.test.ts` with modal-open branches
  next to the existing Help Center branches.
- wp-admin: no JS harness for the inline script. Verify manually on the Site Setup
  page (the reported repro) and assert in the existing PHPUnit test that the
  emitted script contains the observer.
- Manual: open a WP `Modal` on top of a visible survey and confirm it closes.
