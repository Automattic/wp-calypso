# Products

This module is used to manage products for a site.

## Actions

### `createProduct( siteId, product, [successAction], [failureAction] )`

Create a product on the remote site via API. May also call action creator callbacks: successAction on successful product creation, or failureAction on an error.

### `fetchProducts( siteId: number, params )`

Pull products from the remote site. Does not run if a specific server page is already loading. Params passed here go through to the API endpoint for things like `page`, `offset`, or `search`. Defaults: `page: 1`, `per_page: 10`

## Reducer

A list of products as returned from the site's API, saved on a per-site basis.

Products are collected in `products`, `isLoading` indicates which pages are being requested. `totalPages` tracks the number of pages of products. The products example below is not a complete list of product arguments. See the [API documentation for products](https://woocommerce.github.io/woocommerce-rest-api-docs/#products).

```js
const object = {
	products: {
		queries: {
			// Keyed by request parameters
			'{}': {
				id: [ 31, 32, 33 /*...*/ ],
				isLoading: false,
				totalPages: 2,
				totalProducts: 18,
			},
			'{"page":2}': {
				isLoading: true,
			},
			'{"search":"test"}': {
				id: [ 32, 43 /*...*/ ],
				isLoading: false,
				totalPages: 2,
				totalProducts: 18,
			},
		},
		products: [
			{
				id: 31,
				name: 'Sticker',
				slug: 'sticker',
				permalink: 'https://woo.local/product/sticker/',
				date_created: '2013-06-07T10:49:51',
				/*...*/
			},
		],
	},
};
```

## Selectors

### `areProductsLoaded( state, params, [siteId] )`

Whether the product list on a given page has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areProductsLoading( state, params, [siteId] )`

Whether the product list on a given page is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getProducts( state, params, siteId: number )`

Get the products that belong to a given request query. Optional `siteId`, will default to currently selected site.

### `getProduct( state, productId: number, siteId: number )`

Get a single product matching a given product ID. Optional `siteId`, will default to currently selected site.

### `getTotalProductsPages( state, params, siteId: number )`

Gets the total number of pages of products available for a request query. Optional `siteId`, will default to currently selected site.

### `getTotalProducts( state, params, siteId: number )`

Gets the total number of products available for a request query. Optional `siteId`, will default to currently selected site.
