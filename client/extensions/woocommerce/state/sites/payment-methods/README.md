# Payment Methods

This module is used to manage payment methods for a site.

## Actions

### `fetchPaymentMethods( siteId: number )`

Get the payment methods available on a site.

## Reducer

A list of supported payment methods as returned from the site's API, saved on a per-site basis.

```js
const object = {
	paymentMethods: [
		{
			id: 'bacs',
			title: 'Direct bank transfer',
			description:
				"Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order won't be shipped until the funds have cleared in our account.",
			order: '',
			enabled: false,
			method_title: 'BACS',
			method_description:
				'Allows payments by BACS, more commonly known as direct bank/wire transfer.',
			settings: {
				/*...*/
			},
			methodType: 'offline',
		},
		{
			/*...*/
		},
	],
};
```

## Selectors

### `arePaymentMethodsLoaded( state, [siteId] )`

Whether the payment methods list has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `arePaymentMethodsLoading( state, [siteId] )`

Whether the payment methods list is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getPaymentMethodsGroup( state, type, [siteId] )`

Gets group of payment methods by type (offline, off-site, on-site). Optional `siteId`, will default to currently selected site.

### `getPaymentMethod( state, methodId, [siteId] )`

Get a single payment method by method name (bacs, cheque, etc). Returns false if no method found. Optional `siteId`, will default to currently selected site.
