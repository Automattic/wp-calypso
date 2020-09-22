# Product Categories

This module is used to manage product categories for a site.

## Actions

### `fetchProductCategories( siteId: number, query: object )`

Get the list of product categories from the remote site.
An optional query can be provided. See <https://woocommerce.github.io/woocommerce-rest-api-docs/#list-all-product-categories> for available fields.

## Reducer

Product categories are saved on a per-site basis. All categories are collected in `items`, and there is a query => ID mapping in `queries`. `isQueryLoading` indicates which queries are being requested. `isQueryError` indicates if a query returned an error. `total` tracks the total number of categories, mapped by queries. `totalPages` returns the total number of results pages for a query.

```js
const object = {
	productCategories: {
		// Keyed by serialized query
		isQueryLoading: {
			'{}': false,
			'{"page":2}': true,
		},
		isQueryError: {
			'{}': false,
		},
		// Keyed by ID
		items: {
			1: {
				id: 1,
				name: 'Watercolor',
				slug: 'watercolor',
				parent: 0,
				description: '',
				display: 'default',
				image: [],
				menu_order: 0,
				count: 2,
			},
			// ...
		},
		// Keyed by serialized query (a list of category IDs)
		queries: {
			'{}': [ 1, 2, 3, 4, 5 ],
			'{"page":2}': [ 6, 7, 8, 9, 10 ],
		},
		// Keyed by serialized query, without page.
		total: {
			'{}': 10,
		},
		totalPages: {
			'{}': 2,
		},
	},
};
```

## Selectors

### `areProductCategoriesLoaded( state, query, [siteId] )`

Whether product categories for a given query have been successfully loaded from the server. Optional `siteId`, will default to the currently selected site.

### `areProductCategoriesLoading( state, query, [siteId] )`

Whether product categories for a given query are currently being retrieved from the server. Optional `siteId`, will default to the currently selected site.

### `getProductCategories( state, query, siteId: number )`

Get the list of categories from a given site for a given query, or an empty array if nothing's there yet.

### `getProductCategory( state, categoryId: number, siteId: number )`

Gets a requested product category object from the current state, or null if not yet loaded.

### `getTotalProductCategories( state, query: object, siteId: number )`

Gets the total number of product categories available on a site for a query. Optional `siteId`, will default to the currently selected site.

### `getProductCategoriesLastPage( state, query: object, siteId: number )`

Returns the last page number of results for a query. Optional `siteId`, will default to the currently selected site.

### `areAnyProductCategoriesLoading( state, siteId: number )`

Similar to `areProductCategoriesLoading`, this selector returns if any given request is being loaded from a site -- meaning this will return if there is a pending request for any query against a site. Optional `siteId`, will default to the currently selected site.

### `getAllProductCategories( state, siteId: number )`

Similar to `getProductCategories`, this selector returns all results across all loaded pages. Optional `siteId`, will default to the currently selected site.
