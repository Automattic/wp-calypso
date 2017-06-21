Orders
======

This module is used to manage orders for a site.

## Actions

### `fetchOrder( siteId: number, orderId: number )`

Fetch a single order from the remote site. Does not run if this order is loading or already loaded.

### `fetchOrders( siteId: number, page: number )`

Pull a page of orders from the remote site. Does not run if the orders are loading or already loaded.

## Reducer

This is saved on a per-site basis. All orders are collected in `items`, and there is a query => ID mapping in `queries`. `isQueryLoading` indicates which queries are being requested. Currently this is only paged requests (but will allow for filtered queries in v2). `totalPages` tracks the number of pages of orders (this might update to a query mapping later). `isLoading` tracks whether single order requests have been requested/loaded. The order items example below is not a complete list. See the [API documentation for orders](http://woocommerce.github.io/woocommerce-rest-api-docs/#order-properties).

```js
{
	"orders": {
		// Keyed by serialized query
		"isLoading": {
			10: false,
			12: true
		},
		// Keyed by serialized query
		"isQueryLoading": {
			'{page:1}': false,
			'{page:2}': true
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
		// Keyed by serialized query (a list of post IDs)
		"queries": {
			'{page:1}': [ 1, 2, 3, 4, 5 ],
			'{page:2}': [ 6, 7, 8, 9, 10 ]
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

### `isOrderLoaded( state, orderId, [siteId] )`

Whether the given order has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `isOrderLoading( state, orderId, [siteId] )`

Whether the given order is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getOrders( state, page: number, siteId: number )`

Gets the list of orders for this page from the current state, or an empty array if not yet loaded.

### `getOrder( state, orderId: number, siteId: number )`

Gets a requested order object from the current state, or null if not yet loaded.

### `getTotalOrdersPages( state, siteId: number )`

Gets the total number of pages of orders available on a site. Optional `siteId`, will default to currently selected site.
