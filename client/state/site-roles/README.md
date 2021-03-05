# Site Roles

A module for managing site roles.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `requestSiteRoles( siteId: number )`

Get a list of supported user roles for a given site.

```js
import { requestSiteRoles } from 'calypso/state/site-roles/actions';

requestSiteRoles( 12345678 );
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `siteRoles`, with the following structure:

```js
state.siteRoles = {
	requesting: {
		12345678: false,
		87654321: true,
	},
	items: {
		12345678: [
			{
				name: 'administrator',
				display_name: 'Administrator',
				capabilities: {
					activate_plugins: true,
					edit_users: true,
					manage_options: true,
				},
			},
			{
				name: 'customer',
				display_name: 'Customer',
				capabilities: {
					read: true,
				},
			},
		],
	},
};
```

## Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

### `isRequestingSiteRoles`

Returns true if user roles are currently fetching for the given site ID.

```js
import { isRequestingSiteRoles } from 'calypso/state/site-roles/selectors';

const isRequesting = isRequestingSiteRoles( state, 12345678 );
```

### `getSiteRoles`

Returns an array of all supported user roles for the given site ID.

```js
import { getSiteRoles } from 'calypso/state/site-roles/selectors';

const siteRoles = getSiteRoles( state, 12345678 );
```
