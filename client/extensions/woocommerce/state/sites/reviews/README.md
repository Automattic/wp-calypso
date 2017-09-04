Reviews
======

This module is used to manage reviews for a site.

## Actions

### `fetchReviews( siteId: number, query: object )`

Pull a set of reviews from the remote site, based on a query. See https://github.com/woocommerce/wc-api-dev/pull/48.

## Reducer

This is saved on a per-site basis. All reviews are collected in `items`, and there is a query => ID mapping in `queries`. `isQueryLoading` indicates which queries are being requested. `total` tracks the number of reviews, mapped by queries (not including page). `isQueryError` tracks whether a specific query returned an error while being fetched. The review items example below is not a complete list. See the [API documentation for reviews](https://woocommerce.github.io/woocommerce-rest-api-docs/#product-review-properties).

```js
{
	"reviews": {
		// Keyed by serialized query
		"isQueryLoading": {
			'{}': false,
			'{"page":2}': true
		},
		"isQueryError": {
			'{"page":3}': true
		},
		// Keyed by review ID
		"items": {
			1: {
				"id": 1,
				"product_id": 549,
				"review": "Test",
				"rating": 5,
				...
			},
			2: { … }
		},
		// Keyed by serialized query (a list of review IDs)
		"queries": {
			'{}': [ 1, 2, 3, 4, 5 ],
			'{"page":2}': [ 6, 7, 8, 9, 10 ]
		},
		// Keyed by serialized query, without page.
		"total": {
			'{"status":"any"}': 50,
			'{"status":"processing"}': 8,
		}
	}
}
```
