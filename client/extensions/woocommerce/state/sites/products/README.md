Products
========

This module is used to manage products for a site.

## Actions

### `createProduct( siteId, product, [successAction], [failureAction] )`

Create a product on the remote site via API. May also call action creator callbacks: successAction on successful product creation, or failureAction on an error.

## Actions

### `fetchProducts( siteId: number, page )`

Pull products from the remote site. Does not run if the products for a particular page are loading or already loaded.


## Reducer

A list of products as returned from the site's API, saved on a per-site basis.

Products are collected in `products`, and there is a page => ID mapping in `pages`. `isLoading` indicates which pages are being requested. `totalPages` tracks the number of pages of products. The products example below is not a complete list of product arguments. See the [API documentation for products](https://woocommerce.github.io/woocommerce-rest-api-docs/#products).

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
		// Keyed by page number (a list of product IDs)
		"pages": {
			1: [ 1, 2, 3, 4, 5 ],
			2: [ 6, 7, 8, 9, 10 ]
		},
		// The total number of pages for this site's products.
		"totalPages": 6
	}
}
```

## Selectors

### `areProductsLoaded( state, page, [siteId] )`

Whether the product list on a given page has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areProductsLoading( state, page, [siteId] )`

Whether the product list on a given page is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getProducts( state, page: number, siteId: number )`

Gets the list of products for this page from the current state, or an empty array if not yet loaded.

### `getTotalProductsPages( state, siteId: number )`

Gets the total number of pages of products available on a site. Optional `siteId`, will default to currently selected site.
