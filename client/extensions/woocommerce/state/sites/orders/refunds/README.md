# Order Refunds

This module is used to manage refunds for orders on a site.

## Actions

### `fetchRefunds( siteId: number, orderId: number )`

Trigger a request to get a list of refunds for a given orderID from the remote site.

### `sendRefund( siteId: number, orderId: number, refund: object, onSuccess: object, onFailure: object )`

Create a refund for the given order. Refund should have `amount` & an optional `reason`, both strings. Does not run if there's already a refund request for this order. `onSuccess` & `onFailure` are optional; if not set, they default to triggering a success or error notice.

## Reducer

This is saved inside the orders state tree, which is keyed by site ID. Children of `refunds` are objects keyed by order ID, with `isSaving` and `items` properties. `isSaving` is a boolean, tracking whether an order refund is currently being submitted (saved). `items` lists all the refunds for that order.

```js
const object = {
	refunds: {
		// Keyed by order ID
		10: {
			isSaving: true,
			items: [
				{
					/*refund object*/
				},
			],
		},
	},
};
```

## Selectors

### `getOrderRefunds( state, orderId, [siteId] )`

Get the list of refund objects as returned from the remote site API. Optional `siteId`, will default to currently selected site.

### `isOrderRefunding( state, orderId, [siteId] )`

Whether an order refund has been requested (or completed). Optional `siteId`, will default to currently selected site.
