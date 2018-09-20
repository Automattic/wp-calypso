Site Vouchers
=============

A module for managing site vouchers data.

# Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `requestSiteVouchers( siteId )`

Fetches vouchers for the site with the given site ID.

### `assignSiteVoucher( siteId, serviceType )`

Assign a `serviceType` voucher to the given site.

## Action creators

> Action creators are exactly that—functions that create actions.

### `vouchersReceiveAction( siteId, vouchers )`

### `vouchersRequestAction( siteId )`

### `vouchersRequestSuccessAction( siteId )`

### `vouchersRequestFailureAction( siteId, error )`

### `vouchersAssignReceiveAction( siteId, serviceType, voucher )`

### `vouchersAssignRequestAction( siteId, serviceType )`

### `vouchersAssignRequestSuccessAction( siteId, serviceType )`

### `vouchersAssignRequestFailureAction( siteId, serviceType, error )`

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
		[ siteId ]: {
			getAll: Boolean,
			assign: Boolean
		}
	],

	errors: [
		[ siteId ]: {
			getAll: Boolean,
			assign: Boolean
		}
	]
}
```
