# User store

This store includes behavior for checking if a user is logged in, and fetching info about the current user.

## Usage

Register the user store:

```js
import { User } from '@automattic/data-stores';

const USER_STORE = User.register();
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
