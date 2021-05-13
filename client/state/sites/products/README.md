# Site Products

A module for managing site products data.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `fetchSiteProducts( siteId: Number )`

Fetches products for the site with the given site ID.

### `fetchSiteProductsCompleted( siteId: Number, data: Object )`

Adds the products fetched from the API to the set of products for the given site ID.

```js
import {
	fetchSiteProducts,
	fetchSiteProductsCompleted,
} from 'calypso/state/sites/products/actions';

dispatch( fetchSiteProducts( 555555555 ) );
dispatch(
	fetchSiteProductsCompleted( 555555555, {
		jetpack_search: {
			/*...*/
		},
		jetpack_search_monthly: {
			/*...*/
		},
	} )
);
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `sites.products`.
