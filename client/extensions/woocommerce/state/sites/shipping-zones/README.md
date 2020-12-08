# Shipping Zones

This module is used to manage the shipping zones for a site.

## Actions

### `fetchShippingZones( siteId: number )`

Pull shipping zones from the remote site. Does not run if the shipping zones are loading or already loaded.

## Reducer

This is saved on a per-site basis, either as "LOADING" (when requesting zones), or a list of zones as returned from the site's API.

```js
const object = {
	shippingZones: 'LOADING',
};
```

```js
const object = {
	shippingZones: [
		{
			id: 0,
			name: 'Locations not covered by your other zones',
			order: 0,
		},
		{
			/*...*/
		},
	],
};
```

## Selectors

### `areShippingZonesLoaded( state, [siteId] )`

Whether the shipping zones list has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areShippingZonesLoading( state, [siteId] )`

Whether the shipping zones list is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getAPIShippingZones( state, [siteId] )`

Get list of shipping zones for a site. Optional `siteId`, will default to currently selected site.
