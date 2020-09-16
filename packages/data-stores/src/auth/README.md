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
	loadCookiesAfterLogin: true, // Read more below
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
	const loginFlowState = useSelect( ( select ) => select( AUTH_STORE ).getLoginFlowState() );
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
	const loginFlowState = useSelect( ( select ) => select( AUTH_STORE ).getLoginFlowState() );
	const { submitUsernameOrEmail, submitPassword } = useDispatch( AUTH_STORE );

	switch ( loginFlowState ) {
		case 'ENTER_USERNAME_OR_EMAIL':
			return (
				<form onSubmit={ ( e ) => submitUsernameOrEmail( e.target.username.value ) }>
					<label htmlFor="username">Username or email</label>
					<input id="username" name="username" required />
				</form>
			);

		case 'ENTER_PASSWORD':
			return (
				<form onSubmit={ ( e ) => submitPassword( e.target.password.value ) }>
					<label htmlFor="password">Username or email</label>
					<input id="password" name="password" type="password" required />
				</form>
			);

		default:
			return null;
	}
}
```

### `loadCookiesAfterLogin` config

After login is complete (`loginFlowState === 'LOGGED_IN'`) the user will have a session on the server, but the client won't have all the cookies for that session yet. In particular it won't have the cookies needed by `wpcom-proxy-request` to talk to `public-api.wordpress.com`.

This could be fine under some circumstances. If, after a successful login, the browser navigates to another page then the cookies will be loaded as part of that page navigation. It would be a waste for the auth store to retrieve them. In this case use `loadCookiesAfterLogin = false`.

If however the user will continue to work and make more requests on the same page after logging in, then we want the store to make the required request to get cookies. In this case use `loadCookiesAfterLogin = true`.

The flag defaults to `true`.

_Implementation detail:_ under the hood, if `loadCookiesAfterLogin === true` then the store will reload the iframe used by `wpcom-proxy-request` to send requests to `public-api.wordpress.com`. Because it's only the iframe that reloads the user won't see a browser refresh happen.
