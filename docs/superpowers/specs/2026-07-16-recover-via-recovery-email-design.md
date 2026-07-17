# Recover via recovery email — bare-bones POC

**Date:** 2026-07-16
**Linear:** DOTOBRD-377 (Can't use account recovery methods)
**Base branch:** `add/account-recovery-recover-via-phone` (stacked; provides the data layer)

## Goal

On the "Lost your password?" page, add a self-service path that verifies the
user through their **dedicated recovery email** (`secondary_email`) and lets
them reset their password. This is the case the existing flow can't cover: the
current "Reset my password" button only ever emails the account's **primary**
email, so a user who has lost access to that primary inbox has no way through.

Scope here is a proof of concept: the simplest UI that exercises the account
recovery endpoints end to end. Product and design will iterate later.

## Background

- The "Lost your password?" page lives in `client/blocks/login/index.jsx`
  under the `action === 'lostpassword'` branch. It lazy-loads
  `LostPasswordForm` (`client/blocks/login/lost-password-form.jsx`), which
  POSTs to `wp-login.php?action=lostpassword` — the classic "email a reset
  link to the primary address" flow.
- A Redux-free data layer for the account-recovery endpoints already exists on
  the base branch: `client/blocks/login/lost-password/use-account-recovery-reset.ts`
  (`lookup` → `requestReset` → `validate` → `reset`). It already supports the
  `secondary_email` method.
- An untracked sibling POC, `recover-via-phone-form.tsx`, does the same flow for
  SMS. It is not wired to any route or link — nothing renders it. So the phone
  work gives us a component pattern to mirror, but no wiring to reuse.

### Key constraint

The account-recovery endpoints verify identity only to let the user **reset
their password**. There is no API that turns a recovery-email code alone into a
signed-in session. So the flow ends at "set a new password" and sends the user
to the normal login page.

## Design

### 1. New: `client/blocks/login/lost-password/recover-via-email-form.tsx`

A near-mirror of the untracked `recover-via-phone-form.tsx`, using the
`secondary_email` method. Four local steps:

1. **username** — `lookup({ user })`. If `secondary_email` is absent, show the
   error "No recovery email is configured for this account." Otherwise
   `requestReset({ userData, method: 'secondary_email' })` and store the
   obscured hint, then advance.
2. **code** — "We sent a code to `j****e@gmail.com`. Enter it below." →
   `validate({ userData, method: 'secondary_email', key: code })`.
3. **new-password** — `reset({ userData, method: 'secondary_email', key: code,
   password })`.
4. **done** — "Continue to log in" button → normal `/log-in` (via
   `login( { locale } )`).

State, error handling, and markup follow the phone form (same
`login__lostpassword-form` / `login__form-userdata` / `login__form-action`
classes, `@wordpress/components` Button, `FormTextInput`, `FormInputValidation`).

### 2. New: `client/blocks/login/lost-password/lost-password-content.tsx`

A small functional wrapper that owns the inline-swap state:

- `useState<'reset' | 'recovery-email'>('reset')`.
- **reset** mode: renders `LostPasswordForm` (all current props passed through)
  followed by an "Access with your recovery email" link that switches to
  `recovery-email` mode.
- **recovery-email** mode: renders `RecoverViaEmailForm` followed by a "Back"
  link that returns to `reset` mode.

The link is rendered by the wrapper (not inside `LostPasswordForm`), so
`LostPasswordForm` stays untouched.

### 3. Change: `client/blocks/login/index.jsx`

In the `action === 'lostpassword'` branch, swap the lazy-loaded component from
`LostPasswordForm` to the new wrapper (`loadLostPasswordContent`), passing the
identical prop set (`redirectToAfterLoginUrl`, `oauth2ClientId`, `locale`,
`isWoo`, `isWooJPC`, `from`, `isJetpack`). Keeps code-splitting; the wrapper
forwards the props to `LostPasswordForm`.

## Out of scope (YAGNI for the POC)

- No route or URL change (inline swap only).
- No analytics / Tracks events.
- No "resend code" affordance.
- No `primary_email` fallback (that overlaps the existing flow and blurs the
  point of the recovery email).
- No blackbox challenge on the recovery form.
- No new automated tests beyond the data layer's existing coverage (a
  follow-up).

## To verify when testing

Confirm that `request-reset` for `secondary_email` actually delivers a **code**
the user types back (the data layer assumes this), and not a click-through
link. If it delivers a link, the **code** step needs rethinking.
