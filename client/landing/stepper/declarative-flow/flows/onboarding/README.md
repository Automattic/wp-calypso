# onboarding flow

## Testing instructions

Please improve the instructions on how to test this flow.

1. Go to /setup/onboarding.

### Email verification step

Gated behind the `onboarding/email-verification` feature flag. It runs **right
after account creation** (before domains), for **every new email/password
signup** regardless of plan. Social logins and existing/already-verified accounts
pass straight through without seeing it (or being counted). The activation email
from signup is the one to confirm — the step doesn't send another; only the manual
"resend" does.

1. In an incognito window, go to /setup/onboarding and create a new account with
   an email and password.
2. Verify: immediately after account creation, the `email-verification` step
   appears, before the domains step. No second email is sent.
3. Open the activation link from the signup email in another tab. The onboarding
   tab should move on to domains on its own.
4. Alternatively, "I'll do this later" continues to domains without confirming.

## Owned by

@aneeshd16 (Tentative - automatically generated from the last committer)

## Context

[Please link to a P2 discussion or document that contains more context about this flow.]
