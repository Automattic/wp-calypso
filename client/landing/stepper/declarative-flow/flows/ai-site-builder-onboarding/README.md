# ai-site-builder-onboarding flow

Paid-only onboarding for the AI Site Builder (Big Sky). Replaces the free-trial
`ai-site-builder` entry funnel: account → domain → paid plan → checkout → setup choice.

## Testing instructions

1. Go to `/setup/ai-site-builder-onboarding` while logged out and create an account or log in.
2. Choose a domain.
3. Confirm the plan picker shows only Personal, Premium, Business, and Commerce — no Free, no Enterprise.
4. Complete checkout.
5. Confirm you return to the setup-choice screen instead of entering the Site Editor immediately.
6. Confirm “Build with AI” opens the existing Big Sky Site Spec editor.
7. As an Automattician, confirm “Generate Theme” opens the Calypso Site Spec flow with
   `build_wow=1`, the new site ID, and the new site slug.
8. Confirm a `?prompt=` query parameter passed at entry is preserved through checkout and forwarded
   when “Build with AI” is selected.

## Owned by

DOTPROD team

## Context

DOTPROD-110
