# onboarding flow

## Testing instructions

Please improve the instructions on how to test this flow.

1. Go to /setup/onboarding.

### Email verification gate

Gated behind the `onboarding/email-verification` feature flag. It is **not a
separate step** — it is rendered by the account (`user`) step as an interstitial
**right after an email/password account is created**, before the step hands back
to the flow. Social logins and existing sessions never created an account through
the form, so they never see it. The activation email from signup is the one to
confirm — the gate doesn't send another; only the manual
"resend" does.

1. In an incognito window, go to /setup/onboarding and create a new account with
   an email and password.
2. Verify: the gate appears in place of the account screen once the account is
   created, before the domains step. No second email is sent.
3. Open the activation link from the signup email in another tab. The onboarding
   tab should move on to domains on its own.
4. Alternatively, "I'll do this later" continues to domains without confirming.

## Owned by

@aneeshd16 (Tentative - automatically generated from the last committer)

## Context

[Please link to a P2 discussion or document that contains more context about this flow.]
