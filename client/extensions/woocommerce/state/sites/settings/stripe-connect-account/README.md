# StripeConnectAccount Settings

This module works with WooCommerce Services to create Stripe Connect accounts.

## Actions

### `createAccount( siteId: number, emailAddress: string, countryCode: string )`

Attempts to create a Stripe Connect account using the deferred flow. See <https://github.com/Automattic/woocommerce-services/pull/1137>

## Reducer

Updates state in the stripeConnectAccount node under extensions.woocommerce.sites[].settings

When requesting:

```js
const object = {
	stripeConnectAccount: {
		connectedUserID: '',
		email: '',
		isActivated: false,
		isRequesting: true,
	},
};
```

On success:

```js
const object = {
	stripeConnectAccount: {
		connectedUserID: 'acct_14qyt6Alijdnw0EA',
		email: 'user@domain.com',
		isActivated: false,
		isRequesting: false,
	},
};
```

On failure:

```js
const object = {
	stripeConnectAccount: {
		connectedUserID: '',
		email: '',
		isActivated: false,
		isRequesting: false,
	},
};
```
