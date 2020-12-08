# Reviews

This module is used to track the current page, search term, or product being viewed for the reviews list.

## Actions

### `updateCurrentReviewsQuery( siteId: number, query: object)`

Updates the current reviews list query. See <https://github.com/woocommerce/wc-api-dev/pull/48>.

## Reducer

This is saved on a per-site basis. `currentPage` returns the current page being viewed by the user. `currentSearch` returns the current search term being viewed by the user. `currentProduct` returns the current product being viewed, if reviews are filtered down to a specific product.

```js
const object = {
	reviews: {
		123: {
			list: {
				currentPage: 2,
				currentSearch: 'example',
				currentProduct: null,
			},
		},
		234: {
			list: {
				currentPage: 5,
				currentSearch: 'test',
				currentProduct: 50,
			},
		},
	},
};
```

## Selectors

### `getReviewsCurrentPage( state, [siteId] )`

The current page being viewed. Defaults to 1. Optional `siteId`, will default to the currently selected site.

### `getReviewsCurrentProduct( state, [siteId] )`

The current product being viewed, if reviews are being filtered down to a specific product. Defaults to null. Optional `siteId`, will default to the currently selected site.

### `getReviewsCurrentSearch( state, [siteId] )`

The current search term being viewed. Defaults to an empty string. Optional `siteId`, will default to the currently selected site.
