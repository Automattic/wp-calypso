# Site Plans

A module for managing site plans data.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `fetchSitePlans( siteId: Number )`

Fetches plans for the site with the given site ID.

### `fetchSitePlansCompleted( siteId: Number, data: Object )`

Adds the plans fetched from the API to the set of plans for the given site ID.

```js
import { fetchSitePlans, fetchSitePlansCompleted } from 'calypso/state/sites/plans/actions';

dispatch( fetchSitePlans( 555555555 ) );
dispatch(
	fetchSitePlansCompleted( 555555555, {
		1: {
			/*...*/
		},
		1003: {
			/*...*/
		},
		1008: {
			/*...*/
		},
	} )
);
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `sites.plans`.
Consult `assembler.js` for the details.
