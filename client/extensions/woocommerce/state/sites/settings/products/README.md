# Products Settings

This module is used to manage settings for products for a site.

## Actions

### `fetchSettingsProducts( siteId: number )`

Pull products settings from the remote site. Does not run if the settings are loading or already loaded.

## Reducer

This is saved on a per-site basis, either as "LOADING" (when requesting settings), or a list of settings as returned from the site's API.

```js
const object1 = {
	settings: {
		products: 'LOADING',
	},
};
// or
const object2 = {
	settings: {
		products: [
			{
				id: 'woocommerce_weight_unit',
				label: 'Weight unit',
				description: 'This controls what unit you will define weights in.',
				type: 'select',
				default: 'kg',
				options: {
					kg: 'kg',
					g: 'g',
					lbs: 'lbs',
					oz: 'oz',
				},
				tip: 'This controls what unit you will define weights in.',
				value: 'lbs',
			},
			{
				/*...*/
			},
		],
	},
};
```

## Selectors

### `areSettingsProductsLoaded( state, [siteId] )`

Whether the settings list has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areSettingsProductsLoading( state, [siteId] )`

Whether the settings list is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getWeightUnitSetting( state, siteId: number )`

Gets weight unit setting from API data.

### `getDimensionsUnitSetting( state, siteId: number )`

Gets dimensions unit setting from API data.
