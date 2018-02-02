Order Refunds
=============

This module is used to manage refunds for orders on a site.

## Actions

### `sendRefund( siteId: number, orderId: number, refund: object, onSuccess: object, onFailure: object )`

Create a refund for the given order. Refund should have `amount` & an optional `reason`, both strings. Does not run if there's already a refund request for this order. `onSuccess` & `onFailure` are optional; if not set, they default to triggering a success or error notice.

## Reducer

This is saved inside the orders state tree, which is keyed by site ID. It only tracks whether an order refund is currently being submitted (saved). `isSaving` maps order ID to a boolean representing whether it's saving, or completed.

```js
{
	"refunds": {
		// Keyed by order ID
		"isSaving": {
			10: true,
		},
	}
}
```

## Selectors

### `isOrderRefunding( state, orderId, [siteId] )`

Whether an order refund has been requested (or completed). Optional `siteId`, will default to currently selected site.
