# Email Verification

This module exports several utilities for handling new user's email verification flow.

## `page.js` handler

Check if the handled URL has an `verified=1` query param and shows an "Email confirmed" notice
when it does.

### Usage

```js
import emailVerification from 'calypso/components/email-verification';

page( '*', emailVerification );
```

## Email Verification Dialog

Modal dialog you can use to implement parts of UI where a verified email is required. It
will display a modal explaining what to do with the verification email and offers an option
to resend the email.

### Usage

```jsx
import VerifyEmailDialog from 'calypso/components/email-verification/email-verification-dialog';

function UI( { showDialog, closeDialog } ) {
	return (
		<div>
			{ showDialog && <VerifyEmailDialog onClose={ closeDialog } /> }
			<RestOfUI />
		</div>
	);
}
```

## Email Verification Gate Component

Wrapper around your content that will put a notice on top if user's email is unverified.
The wrapped content will be disabled: grayed out and won't react to input events.

### Usage

```jsx
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';

function GatedUI() {
	return (
		<EmailVerificationGate>
			<div>This UI is active only when your email is verified</div>
		</EmailVerificationGate>
	);
}
```

Supported props:

- `noticeText`: custom notice text if you don't want to show the default one
- `noticeStatus`: custom notice status if you don't want to show the default one (`is-info`)
- `allowUnlaunched`: set to `true` if the gated UI is allowed on unlaunched sites even if the
  email is not verified
