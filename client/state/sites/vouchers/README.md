Site Vouchers
=============

A module for managing site vouchers data.

# Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `requestSiteVouchers( siteId: Number )`

Fetches vouchers for the site with the given site ID.

## Action creators

> Action creators are exactly that—functions that create actions.

### vouchersReceiveAction( siteId, response )

### vouchersRequestAction( siteId )

### vouchersRequestSuccessAction( siteId )

### vouchersRequestFailureAction( siteId, error )

```es6
import {
	vouchersReceiveAction,
	vouchersRequestAction,
	vouchersRequestSuccessAction,
	vouchersRequestFailureAction
} from 'state/sites/vouchers/actions';

const siteId = 2916284;

// dispacth a request action
dispatch( vouchersRequestAction( siteId ) );

wpcom
.site( siteId )
.vouchers()
.get( error, response ) => {
	if ( error ) {
		// dispacth a failure action
		return dispatch( vouchersRequestFailureAction( siteId, error.message );
	}

	// dispacth a success action ...
	dispatch( vouchersRequestSuccessAction( siteId ) );
	
	// and populate the global tree dispatching a recieve action
	dispatch( vouchersReceiveAction( site,id, response.vouchers ) );
```

# Reducer
Data from the aforementioned actions is added to the global state tree, under `sites.vouchers`, with the following structure:

```js
state.sites.vouchers = {
	items: {
		[ siteId ]: {
			[ serviceType ] = [
				{
					assigned: Date,
					assigned_by: Number,
					code: String,
					status: String
				}
			]
		}
	},
	
	requesting: [
		[ siteId ]: Boolean
	],

	errors: [
		[ siteId ]: Boolean
	]
}
```
