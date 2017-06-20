Currencies
==============

This module is used to fetch and store the available currencies.

Normally, this could be an static tree, but plugins can modify this information, so it must be fetched in a site-by-site basis.

## Actions

### `fetchCurrencies( siteId: number )`

Pull the currencies from the remote site. Does not run if the currencies are loading or already loaded.

## Reducer

This is saved on a per-site basis, either as "LOADING" (when requesting the currencies), or the array of currencies as returned from the site's API.

```js
{
	"currencies": "LOADING",
	// or
	"currencies": [
		{
			code: "AF",
			name: "Africa",
			countries: [
				{
					code: "SA",
					name: "South Africa",
					states: [],
				},
				{
					code: "EG",
					name: "Egypt",
					states: [],
				},
				{ ... }
			],
		},
		{
			code: 'NA',
			name: "North America",
			countries: [
				{
					code: "US",
					name: "United States",
					states: [
						{
							code: "AL",
							name: "Alabama",
						},
						{ ... }
					],
				},
				{ ... }
			],
		},
		{ ... }
	],
}
```
