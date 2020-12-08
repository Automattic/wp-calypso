# Sites

This module is used to manage data and requests to/from the WooCommerce API.

## Reducer structure

```js
const objects = {
	[ siteId ]: {
		paymentMethods: {},
		productCategories: {},
		products: {},
		settings: {
			general: {},
			products: {},
		},
		shippingMethods: {},
		shippingZoneMethods: {},
		shippingZones: {},
	},
};
```

- [paymentMethods](payment-methods/README.md)
- [productCategories](product-categories/README.md)
- [products](products/README.md)
- [settings: general](settings/general/README.md)
- [settings: products](settings/products/README.md)
- [shippingZones](shipping-zones/README.md)

## request.js

This adds a higher-level layer on top of the WPCOM.JS library, made specifically for making requests to a Jetpack-connected WooCommerce site. This should not need to be accessed outside of actions in this sub-tree.
