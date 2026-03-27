# Resurrected Free Users – Welcome Back Modal

This module powers the welcome-back modal for eligible resurrected free users (180-day inactivity, no active paid subscriptions).

## Components

- **`useResurrectedFreeUserEligibility`** – Determines eligibility (dormancy threshold, purchase checks) and returns the variation name for analytics. All eligible users see the MANUAL experience.
- **`ResurrectedWelcomeModalGate`** – Renders the modal when eligible, dedupes per session, and emits impression/CTA analytics.

## Feature flag

- **`welcome-back-modal-manual`** – When enabled (e.g. `ENABLE_FEATURES=welcome-back-modal-manual yarn start`), forces the modal to show for the current user regardless of eligibility, for local/testing.

## Analytics

- `calypso_resurrected_welcome_modal_impression` – Fired once per session when the modal opens (`variation`).
- `calypso_resurrected_welcome_modal_cta_click` – Fired on CTA press (`variation`, `cta_id`).
- `calypso_resurrected_welcome_modal_dismiss` – Fired on close (`variation`, `source`: `'cta'` | `'close'`).

## Events

- `calypso_user_resurrected` – Legacy 373-day resurrection.
- `calypso_user_resurrected_6m` – 180-day resurrection (used for this modal).
