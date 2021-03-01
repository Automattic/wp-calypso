# Shipping Zones

This module is used to fetch and store the available locations (continents, countries and states) in the world.
Normally, this could be an static tree, but plugins can modify this information, so it must be fetched in a site-by-site basis.

## Actions

### `fetchLocations( siteId: number )`

Pull the locations tree from the remote site. Does not run if the locations are loading or already loaded.

## Reducer

This is saved on a per-site basis, either as "LOADING" (when requesting the locations), or the tree of locations as returned from the site's API.

```js
const object1 = {
	locations: 'LOADING',
};
// or
const object2 = {
	locations: [
		{
			code: 'AF',
			name: 'Africa',
			countries: [
				{
					code: 'SA',
					name: 'South Africa',
					states: [],
				},
				{
					code: 'EG',
					name: 'Egypt',
					states: [],
				},
				{
					/*...*/
				},
			],
		},
		{
			code: 'NA',
			name: 'North America',
			countries: [
				{
					code: 'US',
					name: 'United States',
					states: [
						{
							code: 'AL',
							name: 'Alabama',
						},
						{
							/*...*/
						},
					],
				},
				{
					/*...*/
				},
			],
		},
		{
			/*...*/
		},
	],
};
```
