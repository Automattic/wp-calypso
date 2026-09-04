# ai-site-builder-onboarding flow

Paid-only onboarding for the AI Site Builder (Big Sky). Replaces the free-trial
`ai-site-builder` entry funnel: account → domain → paid plan → checkout → Site Spec.

## Testing instructions

1. Go to `/setup/ai-site-builder-onboarding` while logged out and create an account or log in.
2. Choose a domain.
3. Confirm the plan picker shows only Personal, Premium, Business, and Commerce — no Free, no Enterprise.
4. Complete checkout.
5. Confirm you land in the Big Sky Site Spec editor (`site-editor.php?canvas=edit&ai-step=spec`).
6. Confirm a `?prompt=` query param passed at entry is forwarded to the Site Spec editor.
7. Where the `calypso/ai-site-builder-build-wow` feature is enabled (development and staging),
   confirm that buying any plan (all of Personal, Premium, Business, and Commerce carry the Atomic
   feature build-wow needs) lands checkout on the build-wow site spec
   (`/setup/ai-site-builder-spec/site-spec?build_wow=1`), the same destination as the
   post-checkout "Create a custom design" card, and that `source`/`ref`/`prompt` are carried over.

## Owned by

DOTPROD team

## Context

DOTPROD-110
