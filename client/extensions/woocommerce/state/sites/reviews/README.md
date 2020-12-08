# Reviews

This module is used to manage reviews for a site.

## Actions

### `fetchReviews( siteId: number, query: object )`

Pull a set of reviews from the remote site, based on a query. See <https://github.com/woocommerce/wc-api-dev/pull/48>.

### `deleteReview( siteId: number, productId: number, reviewId: number )`

Deletes a review from the remote site.

### `changeReviewStatus( siteId: number, productId: number, reviewId: number, currentStatus: string, newStatus: string )`

Updates the status of a review on the remote site.

## Reducer

This is saved on a per-site basis. All reviews are collected in `items`, and there is a query => ID mapping in `queries`. `isQueryLoading` indicates which queries are being requested. `total` tracks the number of reviews, mapped by queries (not including page). `isQueryError` tracks whether a specific query returned an error while being fetched. The review items example below is not a complete list. See the [API documentation for reviews](https://woocommerce.github.io/woocommerce-rest-api-docs/#product-review-properties).

```js
const object = {
	reviews: {
		// Keyed by serialized query
		isQueryLoading: {
			'{}': false,
			'{"page":2}': true,
		},
		isQueryError: {
			'{"page":3}': true,
		},
		// Keyed by review ID
		items: {
			1: {
				id: 1,
				product_id: 549,
				review: 'Test',
				rating: 5,
				/*...*/
			},
			2: {
				/*...*/
			},
		},
		// Keyed by serialized query (a list of review IDs)
		queries: {
			'{}': [ 1, 2, 3, 4, 5 ],
			'{"page":2}': [ 6, 7, 8, 9, 10 ],
		},
		// Keyed by serialized query, without page.
		total: {
			'{"status":"any"}': 50,
			'{"status":"processing"}': 8,
		},
	},
};
```

## Selectors

### `areReviewsLoaded( state, query, [siteId] )`

Whether reviews for a given query have been successfully loaded from the server. Optional `siteId`, will default to the currently selected site.

### `areReviewsLoading( state, query, [siteId] )`

Whether reviews for a given query are currently being retrieved from the server. Optional `siteId`, will default to the currently selected site.

### `getReviews( state, query: object, siteId: number )`

Gets reviews for the specified query from the current state, or an empty array if not yet loaded.

### `getReview( state, reviewId: number, siteId: number )`

Gets a requested review object from the current state, or null if not yet loaded.

### `getTotalReviews( state, query: object, siteId: number )`

Gets the total number of reviews available on a site for a query. Optional `siteId`, will default to the currently selected site.
