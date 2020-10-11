# Sending Order Invoices

This module is used to track the request of sending a customer an order invoice.

## Actions

### `sendOrderInvoice( siteId: number, orderId: number, onSuccess: object, onFailure: object )`

Send the customer an email invoice for the given order. `onSuccess` & `onFailure` are two action-objects which can be used to trigger a notice on completion.

## Reducer

This is saved inside the orders state tree, which is keyed by site ID. It only tracks whether an order invoice is currently being sent. `isSending` maps order ID to a boolean representing whether the request is in-flight or completed.

```js
const object = {
	invoice: {
		// Keyed by order ID
		isSending: {
			10: true,
		},
	},
};
```

## Selectors

### `isOrderInvoiceSending( state, orderId, [siteId] )`

Whether an order invoice request is in-flight. Optional `siteId`, will default to currently selected site.
