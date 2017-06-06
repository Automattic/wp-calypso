Orders
======

This module is used to manage orders for a site.

## Actions

### `fetchOrders( siteId: number )`

Pull orders from the remote site. Does not run if the orders are loading or already loaded.

## Reducer

This is saved on a per-site basis, either as "LOADING" (when requesting orders), or a list of orders as returned from the site's API. The example below is not a complete list. See the [API documentation for orders](http://woocommerce.github.io/woocommerce-rest-api-docs/#order-properties).

```js
{
	"orders": "LOADING",
	// or
	"orders": [ {
		"id": 1,
		"status": "processing",
		"currency": "USD",
		"billing": {},
		"payment_method": "stripe",
		…
	}, { … } ],
}
```

## Selectors

### `areOrdersLoaded( state, [siteId] )`

Whether the order list has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areOrdersLoading( state, [siteId] )`

Whether the order list is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getOrders( state, siteId: number )`

Gets the list of orders from the current state, or an empty array if not yet loaded.
