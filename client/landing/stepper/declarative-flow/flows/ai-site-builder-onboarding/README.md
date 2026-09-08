# ai-site-builder-onboarding flow

Paid-only onboarding for the AI Site Builder (Big Sky). Replaces the free-trial
`ai-site-builder` entry funnel: account → domain → paid plan → checkout → Site Spec.

## Testing instructions

1. Go to `/setup/ai-site-builder-onboarding` while logged out and create an account or log in.
2. Choose a domain.
3. Confirm the plan picker shows only Personal, Premium, Business, and Commerce — no Free, no Enterprise.
4. Complete checkout.
5. Confirm that buying any plan (all of Personal, Premium, Business, and Commerce carry the Atomic
   feature build-wow needs) lands checkout on the build-wow site spec
   (`/setup/ai-site-builder-spec/site-spec?build_wow=1`), the same destination as the
   post-checkout "Create a custom design" card.
6. Confirm `source`, `ref`, and a `?prompt=` query param passed at entry are carried over to the
   build-wow site spec.
7. With the `site-spec` feature disabled, confirm checkout lands in the legacy Big Sky Site Spec
   editor (`site-editor.php?canvas=edit&ai-step=spec`) instead. On a development, staging, or
   calypso.live build, set a `flags=-site-spec` cookie rather than the `?flags=` query argument:
   the destination is chosen when you submit checkout, and flags only apply per full page load, so
   a query argument set at step 1 is gone by then and the run silently passes through build-wow.

## Owned by

DOTPROD team

## Context

DOTPROD-110
