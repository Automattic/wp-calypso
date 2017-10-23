Products
========

This module is used to manage products for a site.

## Actions

### `createProduct( siteId, product, [successAction], [failureAction] )`

Create a product on the remote site via API. May also call action creator callbacks: successAction on successful product creation, or failureAction on an error.

## Actions

### `fetchProducts( siteId: number, params )`

Pull products from the remote site. Does not run if a specific server page is already loading.
Params passed here go through to the API endpoint for things like `page` or `offset`
Default `per_page` is 10 if none is specified.


## Reducer

A list of products as returned from the site's API, saved on a per-site basis.

Products are collected in `products`, `isLoading` indicates which pages are being requested. `totalPages` tracks the number of pages of products. The products example below is not a complete list of product arguments. See the [API documentation for products](https://woocommerce.github.io/woocommerce-rest-api-docs/#products).

```js
{
	"products": {
		// Keyed by page number
		"isLoading": {
			1: false,
			2: true
		},
		"products": { [
			{
				"id": 31,
				"name": "Sticker",
				"slug": "sticker",
				"permalink": "https://woo.local/product/sticker/",
				"date_created": "2013-06-07T10:49:51",
				…
			},
		] },
		// The total number of pages for this site's products.
		"totalPages": 6
	}
}
```

## Selectors

### `areProductsLoaded( state, params, [siteId] )`

Whether the product list on a given page has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areProductsLoading( state, params, [siteId] )`

Whether the product list on a given page is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getTotalProductsPages( state, siteId: number )`

Gets the total number of pages of products available on a site. Optional `siteId`, will default to currently selected site.
