# Resurrected Free Users – Welcome Back Modal

This module powers the welcome-back modal for eligible resurrected free users. A user is
eligible after 180 days of inactivity when they have no active paid subscriptions.

## Components

- **`useResurrectedFreeUserEligibility`** – Resolves the dormancy and purchase checks, then
  requests an ExPlat assignment only for eligible users.
- **`ResurrectedWelcomeModalGate`** – Renders the assigned experience, dedupes display per
  session, and emits impression and CTA analytics.

## Experiment assignment

The ExPlat experiment is `calypso_resurrected_users_welcome_back_modal_202607`.

| Variation           | Experience                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `control`           | Existing manual welcome-back experience                                                     |
| `treatment_themes`  | Encourages the user to browse themes                                                        |
| `treatment_content` | Continues the most recently modified draft, or starts a new post when no draft is available |
| `treatment_design`  | Sends the user to the Site Editor                                                           |

The existing manual experience is also the default when no ExPlat assignment is available. The
modal waits for an eligible user's assignment before deciding which experience to display.

## Feature flag

- **`welcome-back-modal-manual`** – When enabled (for example,
  `ENABLE_FEATURES=welcome-back-modal-manual yarn start`), forces the modal to display regardless
  of eligibility for local testing. When no assignment is available, it uses the existing manual
  experience.

## Display behavior

- The modal is dismissed for the remainder of the browser session after the user closes it or
  selects a CTA.
- The content variation fetches only the latest modified draft and keeps the modal visible while
  that request resolves.
- The classic Calypso `/sites` mount is separate from the Dashboard client served at
  `my.wordpress.com`; Dashboard does not currently mount this modal.

## Analytics

- `calypso_resurrected_welcome_modal_impression` – Fired once per session when the modal opens (`variation`).
- `calypso_resurrected_welcome_modal_cta_click` – Fired on CTA press (`variation`, `cta_id`).
- `calypso_resurrected_welcome_modal_dismiss` – Fired on close (`variation`, `source`: `'cta'` | `'close'`).

## Events

- `calypso_user_resurrected` – Legacy 373-day resurrection.
- `calypso_user_resurrected_6m` – 180-day resurrection (used for this modal).
