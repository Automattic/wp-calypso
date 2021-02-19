# Currencies

This module is used to fetch and store the available currencies.

Normally, this could be an static tree, but plugins can modify this information, so it must be fetched in a site-by-site basis.

## Actions

### `fetchCurrencies( siteId: number )`

Pull the currencies from the remote site. Does not run if the currencies are loading or already loaded.

## Reducer

This is saved on a per-site basis, either as "LOADING" (when requesting the currencies), or the array of currencies as returned from the site's API.

```js
const object1 = {
	currencies: 'LOADING',
};
// or
const object2 = {
	currencies: [
		{ code: 'Three letter key', name: 'Country currency', symbol: 'currency html symbol' },
		{ code: 'AED', name: 'United Arab Emirates dirham', symbol: '&#x62f;.&#x625;' },
		{ code: 'AFN', name: 'Afghan afghani', symbol: '&#x60b;' },
		/*...*/
	],
};
```
