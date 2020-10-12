# General Settings

This module is used to manage general settings for a site.

## Actions

### `fetchSettingsGeneral( siteId: number )`

Pull general settings from the remote site. Does not run if the settings are loading or already loaded.

## Reducer

This is saved on a per-site basis, either as "LOADING" (when requesting settings), or a list of settings as returned from the site's API.

```js
const object1 = {
	settings: {
		general: 'LOADING',
	},
};
// or
const object2 = {
	settings: {
		general: [
			{
				id: 'woocommerce_allowed_countries',
				label: 'Selling location(s)',
				description: 'This option lets you limit which countries you are willing to sell to.',
				type: 'select',
				default: 'all',
				options: {
					all: 'Sell to all countries',
					all_except: 'Sell to all countries, except for&hellip;',
					specific: 'Sell to specific countries',
				},
				tip: 'This option lets you limit which countries you are willing to sell to.',
				value: 'all',
			},
			{
				/*...*/
			},
		],
	},
};
```

## Selectors

### `areSettingsGeneralLoaded( state, [siteId] )`

Whether the general settings list has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areSettingsGeneralLoading( state, [siteId] )`

Whether the general settings list is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getPaymentCurrencySettings( state, siteId: number )`

Gets payment currency from API data.
