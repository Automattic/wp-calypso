# User store

This store includes behavior for logging users in; including "passwordless" logins, 2-factor auth, etc.

The store manages where the user is in login process. The login UI is responsible for displaying the appropriate components (e.g. password form, 2-factor code form) based on the state of the store, and the store is responsible for advancing through the flow depending on the authentication method the user is using.

## Usage

Register the auth store, passing in a valid client ID and secret:

```js
import { Auth } from '@automattic/data-stores';

const AUTH_STORE = Auth.register( {
	client_id: 'MY_CLIENT_ID', // ⚠️Replace with your app's ID
	client_secret: 'MY_CLIENT_SECRET', // ⚠️Replace with your app's secret
} );
```

### Login flow state

The user can be in the following login states:

- `ENTER_USERNAME_OR_EMAIL`
- `ENTER_PASSWORD`
- `ENTER_2FA_CODE`
- `LOGIN_LINK_SENT`
- `WAITING_FOR_2FA_APP`
- `LOGGED_IN`

To get the current state use the `loginFlowState` selector.

To restart the login flow dispatch the `reset` action.

```js
import { useSelect } from '@wordpress/data';

function MyComponent() {
	const loginFlowState = useSelect( select => select( AUTH_STORE ).getLoginFlowState() );
	const { reset } = useDispatch( AUTH_STORE );

	return (
		<div>
			Current login flow state: { loginFlowState }
			<button onClick={ reset }>Reset login flow</button>
		</div>
	);
}
```

### Entering username and password

The store will need to check whether a password is needed for a given user. Rather than submitting both at once, submit the email to the store first and respond if the login flow state changes.

```js
import { useDispatch, useSelect } from '@wordpress/data';

function MyComponent() {
	const loginFlowState = useSelect( select => select( AUTH_STORE ).getLoginFlowState() );
	const { submitUsernameOrEmail, submitPassword } = useDispatch( AUTH_STORE );

	switch ( loginFlowState ) {
		case 'ENTER_USERNAME_OR_EMAIL':
			return (
				<form onSubmit={ e => submitUsernameOrEmail( e.target[ 'username' ].value ) }>
					<label htmlFor="username">Username or email</label>
					<input id="username" name="username" required />
				</form>
			);

		case 'ENTER_PASSWORD':
			return (
				<form onSubmit={ e => submitPassword( e.target[ 'password' ].value ) }>
					<label htmlFor="password">Username or email</label>
					<input id="password" name="password" type="password" required />
				</form>
			);

		default:
			return null;
	}
}
```
