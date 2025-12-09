# Resurrected Free Users Experiment Foundation

This module contains the reusable primitives that power the `calypso_resurrected_users_welcome_back_modal_202511`
experiment:

- `useResurrectedFreeUserEligibility` - Computes experiment eligibility (180-day inactivity threshold,
  account-level purchase checks, feature-flag gates, and ExPlat assignment).
- Analytics helpers - shared constants for Tracks event names and variation keys.
- `ResurrectedWelcomeModalGate` - A lightweight modal placeholder that renders the correct variant slot and
  emits impression/CTA events when the user is eligible.

## Flow Overview

1. `TrackResurrections` now logs both the legacy 373-day event and a new `calypso_user_resurrected_6m` event so we can
   keep historical data while powering the shorter threshold experiment.
2. `useResurrectedFreeUserEligibility`:
   - waits for user settings + purchases to finish loading,
   - checks the six-month dormancy threshold via `last_admin_activity_timestamp`,
   - ensures the user has no active paid subscriptions (account-level),
   - fetches the ExPlat assignment for `calypso_resurrected_users_welcome_back_modal_202511`,
   - verifies that the corresponding feature flag is enabled for the assigned variant.
3. `ResurrectedWelcomeModalGate` consumes the hook, dedupes display per session, emits analytics, and exposes
   placeholder copy/CTAs for each treatment. The gate is mounted on `/home/:site`, `/sites`, `/reader`, and `/stats`.

## Variations & Feature Flags

| Variation Key           | Description            | Config Flag                      | Placeholder CTAs                                       |
| ----------------------- | ---------------------- | -------------------------------- | ------------------------------------------------------ |
| `control`               | No modal               | `welcome-back-modal-control`     | -                                                      |
| `treatment_ai_only`     | AI-only CTA            | `welcome-back-modal-ai-only`     | “Create a new site with AI” → `/setup/ai-site-builder` |
| `treatment_manual_dual` | Manual + continue      | `welcome-back-modal-manual`      | Manual onboarding + “Continue where I left”            |
| `treatment_ai_dual`     | AI + continue          | `welcome-back-modal-ai-combo`    | AI builder + “Continue where I left”                   |
| `treatment_all_options` | Manual + AI + continue | `welcome-back-modal-all-options` | Manual onboarding, AI builder, continue                |

All variants are feature-flagged so that we can selectively enable treatments during incremental rollouts. Control
remains opt-in so we can disable _all_ UI safely if necessary. Enabling any of the variant flags automatically forces
that experience to render - even if the user would otherwise be ineligible or the experiment assignment has not loaded -
which makes it easy to test each treatment locally.

## Analytics

- `calypso_resurrected_welcome_modal_impression` - Fired once per session when a variant modal opens.
- `calypso_resurrected_welcome_modal_cta_click` - Fired whenever a CTA is pressed with `{ variation, cta_id }`.
- `calypso_resurrected_welcome_modal_dismiss` - Fired whenever the modal closes, with `{ variation, source }`
  capturing whether the dismissal came from a CTA or the close button.

## Next Steps

- Replace the placeholder modal content with the final Figma designs per variant (request links when starting each task).
- Wire CTA destinations to the finalized flows (manual onboarding, AI builder, and continue-with-site actions).
- Hook up the experiment exposure event in ExPlat once the treatment UI ships.
