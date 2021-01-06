# User State

A module for managing user state.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `setCurrentUser( user: Object )`

Sets the current user by user ID.

```js
import { setCurrentUser } from 'calypso/state/current-user/actions';

dispatch( setCurrentUser( { ID: 73705554 } ) );
```

## Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

### `getCurrentUser( state: Object )`

Returns the current user object.

```js
import { getCurrentUser } from 'calypso/state/current-user/selectors';

const currentUser = getCurrentUser( store.getState() );
```
