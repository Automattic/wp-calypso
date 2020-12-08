# Current User

This component is a wrapper module for interacting with the wpcom.js `/me` endpoint to expose current user object and related methods. User info is currently stored in localstorage.

## User

```js
import user from 'calypso/lib/user';

function clearUser() {
	user().clear();
}
```

### `User#get()`

The get request will defer to `User#data` to check for local caches otherwise calling the fetch method.

### `User#fetch()`

Fetch will call `wpcom.me` to get current user data. It stores the results in localstorage with `store` and triggers a 'fetched' event on the object.

### `User#data()`

Currently will just check for local cached data and return it if present.

### `User#clear()`

Clears user stored data and handles relevant redirects based on type of authentication.

## UserUtilities

```js
import user from 'calypso/lib/user/utilities';
```

### `UserUtilities#logout()`

This is a small module that logs a user out by clearing user stored data by calling `User#clear()` and redirects user to WordPress.com to be logged out.

### `UserUtilities#getLogoutUrl()`

Returns a localized logout URL based on the current user's language.

For example, an English speaking user be redirected to `wordpress.com` after being logged, but a Spanish speaking user will be redirected to `es.wordpress.com`.;
