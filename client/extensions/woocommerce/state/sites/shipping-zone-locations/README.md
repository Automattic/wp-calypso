# Shipping Zones

This module is used to fetch and store the shipping locations a zone is configured to represent.

## Actions

### `fetchShippingZoneLocations( siteId: number, zoneId: number )`

Pull the locations tree from the remote site. Does not run if the locations are loading or already loaded.

## Reducer

This is saved on a per-zone basis, either as "LOADING" (when requesting the locations), or an object with the following properties:

- `continent`: List of continent codes the zone is configured to represent.
- `country`: List of country codes the zone is configured to represent.
- `state`: List of states the zone is configured to represent, in the format `countryCode:stateCode`.
- `continent`: List of postcodes or postcode ranges the zone is configured to represent.

```js
const object = {
	shippingZoneLocations: {
		7: 'LOADING', // "7" is the Shipping Zone ID
		9: {
			continent: [ 'EU' ],
			country: [ 'US', 'CA' ],
			state: [ 'US:CA', 'US:UT' ],
			postcode: [ '123*', '68000...68999' ],
		},
	},
};
```

In this example, the shipping zone "9" would match all the orders from Europe, United States, Canada, California, and Utah
(there is overlap, the California and Utah options are redundant, but WooCommerce allows it). The orders would **also** need
to match the given postcode ranges (either start with `123` or be in the `68000...68999` range). This particular configuration
makes no sense, but again, WooCommerce allows it.
