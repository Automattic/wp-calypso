# Orders

This module is used to manage orders for a site.

## Actions

### `fetchOrder( siteId: number, orderId: number, [ refresh: boolean ] )`

Fetch a single order from the remote site. Does not run if this order is loading. If the order is already loaded, and refresh is true, it re-fetches the order. `refresh` defaults to false (won't re-fetch).

### `fetchOrders( siteId: number, query: object )`

Pull a set of orders from the remote site, based on a query. See [available parameters on the API docs](http://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-orders). Does not run if the orders are loading or already loaded.

### `updateOrder( siteId: number, order: object )`

Update a given order on the remote site.

## Reducer

This is saved on a per-site basis. All orders are collected in `items`, and there is a query => ID mapping in `queries`. `isQueryLoading` indicates which queries are being requested. Currently this is only paged requests (but will allow for filtered queries in v2). `total` tracks the number of orders, mapped by queries (not including page). `isLoading` tracks whether single order requests have been requested/loaded. The order items example below is not a complete list. See the [API documentation for orders](http://woocommerce.github.io/woocommerce-rest-api-docs/#order-properties).

```js
const object = {
	orders: {
		// Keyed by order ID
		isLoading: {
			10: false,
			12: true,
		},
		// Keyed by serialized query
		isQueryLoading: {
			'{}': false,
			'{"page":2}': true,
		},
		// Keyed by order ID
		isUpdating: {
			10: true,
		},
		// Keyed by post ID
		items: {
			1: {
				id: 1,
				status: 'processing',
				currency: 'USD',
				billing: {},
				payment_method: 'stripe',
				/*...*/
			},
			2: {
				/*...*/
			},
		},
		// Keyed by serialized query (a list of post IDs)
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

### `areOrdersLoaded( state, query, [siteId] )`

Whether the order list for a given query has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areOrdersLoading( state, query, [siteId] )`

Whether the order list for a given query is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `isOrderLoaded( state, orderId, [siteId] )`

Whether the given order has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `isOrderLoading( state, orderId, [siteId] )`

Whether the given order is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getOrders( state, query: object, siteId: number )`

Gets the list of orders for this query from the current state, or an empty array if not yet loaded.

### `getOrder( state, orderId: number, siteId: number )`

Gets a requested order object from the current state, or null if not yet loaded.

### `getTotalOrders( state, query: object, siteId: number )`

Gets the total number of orders available on a site for a query (like, all completed orders). Optional `siteId`, will default to currently selected site.
