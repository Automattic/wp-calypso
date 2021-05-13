# User store

This store includes behavior for checking if a current user is logged in, and creating new user accounts.

To log the user in see the [auth store](../auth/README.md).

## Usage

Register the user store, passing in a valid client ID and secret:

```js
import { User } from '@automattic/data-stores';

const USER_STORE = User.register( {
	client_id: 'MY_CLIENT_ID', // ⚠️Replace with your app's ID
	client_secret: 'MY_CLIENT_SECRET', // ⚠️Replace with your app's secret
} );
```

### Current user

Check if a current user is logged in:

```js
import { useSelect } from '@wordpress/data';

function MyComponent() {
	const isLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
	// …snip
}
```

### Creating a new account

Creating an account defaults to a passwordless account creation. Pass in `is_passwordless: false` and a `password` param to use the default full account creation.

```js
import { useDispatch } from '@wordpress/data';

function MyComponent() {
	const { createAccount } = useDispatch( USER_STORE );
	const submitHandler = () => createAccount( { email: 'example@example.com' } );
	// …snip
}
```

### Display account creation form, loader and error state

Put altogether, a minimalist signup form can be created with:

```js
import { User } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { Button, Notice, Spinner, TextControl } from '@wordpress/components';
import React, { useState } from 'react';

const USER_STORE = User.register(/* app credentials… */);

function SignupComponent() {
	const [ email, setEmail ] = useState( '' );

	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const newUserError = useSelect( ( select ) => select( USER_STORE ).getNewUserError() );
	const isFetchingNewUser = useSelect( ( select ) => select( USER_STORE ).isFetchingNewUser() );

	const { createAccount } = useDispatch( USER_STORE );

	if ( currentUser ) {
		return (
			<div>
				<span>User is logged in as { currentUser.username }</span>
			</div>
		);
	} else if ( newUser ) {
		return (
			<div>
				<span>New user created: { newUser.username }</span>
			</div>
		);
	}
	return (
		<div>
			{ newUserError && <Notice status="error"> { newUserError.message } </Notice> }
			{ isFetchingNewUser ? (
				<span>Loading…</span>
			) : (
				<form onSubmit={ () => createAccount( { email } ) }>
					<TextControl
						label="Email address"
						value={ email }
						onChange={ ( newEmail ) => setEmail( newEmail ) }
					/>
					<Button isPrimary isLarge type="submit" value="Submit">
						Create Account
					</Button>
				</form>
			) }
		</div>
	);
}
```
