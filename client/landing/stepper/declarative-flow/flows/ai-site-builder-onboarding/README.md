# ai-site-builder-onboarding flow

Paid-only onboarding for the AI Site Builder (Big Sky). Replaces the free-trial
`ai-site-builder` entry funnel: account → domain → paid plan → checkout → Site Spec.

## Testing instructions

1. Enable the `calypso/ai-site-builder-onboarding-flow` feature flag (on by default in development).
2. Go to `/setup/ai-site-builder-onboarding` while logged out and create an account or log in.
3. Choose a domain.
4. Confirm the plan picker shows only Personal, Premium, Business, and Commerce — no Free, no Enterprise.
5. Complete checkout.
6. Confirm you land in the Big Sky Site Spec editor (`site-editor.php?canvas=edit&ai-step=spec`).
7. Confirm a `?prompt=` query param passed at entry is forwarded to the Site Spec editor.

## Owned by

DOTPROD team

## Context

DOTPROD-110
