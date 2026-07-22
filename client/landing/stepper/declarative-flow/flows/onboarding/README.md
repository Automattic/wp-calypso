# onboarding flow

## Testing instructions

Please improve the instructions on how to test this flow.

1. Go to /setup/onboarding.

### Email verification step

Gated behind the `onboarding/email-verification` feature flag, and only reached by
signups that pick the free plan while their email address is still unconfirmed —
social signups arrive confirmed and never see it.

1. Sign up with an email and password at /setup/onboarding.
2. Pick a domain, then choose the free plan.
3. Verify: the `email-verification` step appears and a confirmation email arrives.
4. Open the link from the email in another tab. The onboarding tab should move on
   to site creation on its own.

## Owned by

@aneeshd16 (Tentative - automatically generated from the last committer)

## Context

[Please link to a P2 discussion or document that contains more context about this flow.]
