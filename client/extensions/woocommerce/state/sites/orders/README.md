Orders
======

This module is used to manage orders for a site.

## Actions

### `fetchOrders( siteId: number )`

Pull orders from the remote site. Does not run if the orders are loading or already loaded.

## Reducer

This is saved on a per-site basis. All orders are collected in `items`, and there is a page => ID mapping in `pages`. `isLoading` indicates which pages are being requested. `totalPages` tracks the number of pages of orders. The order items example below is not a complete list. See the [API documentation for orders](http://woocommerce.github.io/woocommerce-rest-api-docs/#order-properties).

```js
{
	"orders": {
		// Keyed by page number
		"isLoading": {
			1: false,
			2: true
		},
		// Keyed by post ID
		"items": {
			1: {
				"id": 1,
				"status": "processing",
				"currency": "USD",
				"billing": {},
				"payment_method": "stripe",
				…
			},
			2: { … } 
		},
		// Keyed by page number (a list of post IDs)
		"pages": {
			1: [ 1, 2, 3, 4, 5 ],
			2: [ 6, 7, 8, 9, 10 ]
		},
		// A single number (the total number of pages for this site's orders)
		"totalPages": 6
	}
}
```

## Selectors

### `areOrdersLoaded( state, page, [siteId] )`

Whether the order list on a given page has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areOrdersLoading( state, page, [siteId] )`

Whether the order list on a given page is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getOrders( state, page: number, siteId: number )`

Gets the list of orders for this page from the current state, or an empty array if not yet loaded.

### `getTotalOrdersPages( state, siteId: number )`

Gets the total number of pages of orders available on a site. Optional `siteId`, will default to currently selected site.
