UI State
========

A module for managing user interface state.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `setSelectedSiteId( siteId: Number )`

Sets the currently selected site by site ID.

```js
import { setSelectedSiteId } from 'state/ui/actions';

dispatch( setSelectedSiteId( 2916284 ) );
```

### `setCurrentUserId( userId: Number )`

Sets the current user by user ID.

```js
import { setCurrentUserId } from 'state/ui/actions';

dispatch( setCurrentUserId( 73705554 ) );
```

## Reducers

The included reducers add the following keys to the global state tree, under `ui`:

### `selectedSiteId`

The currently selected site ID, or `null` if no site is selected.

### `currentUserId`

The current user ID, or `null` if the user has not been assigned as in the case of a logged-out session.

## Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

### `getSelectedSite( state: Object )`

Returns the currently selected site object.

```js
import { getSelectedSite } from 'state/ui/selectors';

const selectedSite = getSelectedSite( store.getState() );
```

### `getCurrentUser( state: Object )`

Returns the current user object.

```js
import { getCurrentUser } from 'state/ui/selectors';

const selectedSite = getCurrentUser( store.getState() );
```
