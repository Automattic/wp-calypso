# Site Features

A module for managing site features data.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `fetchSiteFeatures( siteId: Number )`

Fetches features for the site with the given site ID.

### `fetchSiteFeaturesCompleted( siteId: Number, data: Object )`

Adds the features fetched from the API to the set of features for the given site ID.

```js
import {
	fetchSiteFeatures,
	fetchSiteFeaturesCompleted,
} from 'calypso/state/sites/features/actions';

dispatch( fetchSiteFeatures( 555555555 ) );
dispatch(
	fetchSiteFeaturesCompleted( 555555555, {
		active: {
			/*...*/
		},
		available: {
			/*...*/
		},
	} )
);
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `sites.features`.
