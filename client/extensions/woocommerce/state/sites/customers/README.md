# Customers

This module is used to look up existing customers on a site.

## Actions

### `searchCustomers( siteId: number, email: string )`

Search for a given email in the customer list.

## Reducer

This is saved on a per-site basis.

```js
const object = {
	customers: {
		// Keyed by search query
		isSearching: {
			'lane@example.test': false,
			'person@site.local': true,
		},
		// Keyed by customer ID
		items: {
			2: {
				id: 2,
				email: 'lane@example.test',
				first_name: 'Lane',
				last_name: 'Chase',
				role: 'customer',
				username: 'chase6xe',
				billing: {},
				shipping: {},
				/*...*/
			},
			3: {
				/*...*/
			},
		},
		// Keyed by search query (a list of customer IDs)
		queries: {
			'lane@example.test': [ 2 ],
		},
	},
};
```

## Selectors

### `isCustomerSearchLoaded( state, email: string, [siteId] )`

Whether a customer search has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `isCustomerSearchLoading( state, email: string, [siteId] )`

Whether a customer search is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getCustomerSearchResults( state, email: string, [siteId] )`

Gets a customer list for a given email search term in state, or an empty array if not yet loaded.

### `getCustomer( state, customerId: number, [siteId] )`

Gets a requested customer object from the current state, or null if not yet loaded.
