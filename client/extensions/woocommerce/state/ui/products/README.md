# Products

This module is used to manage UI state related to products on a site.

## Reducer

The state holds both product edits (see [edits-reducer.js](./edits-reducer.js)), and information related to the product list display - current and request query parameters. Both of these are keyed by siteId. For example:

```js
const object = {
	products: {
		[ siteId ]: {
			edits: {
				/*...*/
			},
			list: {
				currentPage: 1,
				currentSearch: 'example',
				requestedPage: null,
				requestedSearch: null,
			},
		},
	},
};
```

## Selectors

For all, `siteId` is optional, and will default to currently selected site if not set.

### `getCurrentlyEditingProduct( state, [siteId] )`

Gets the product being currently edited in the UI.

### `getProductsCurrentPage( state, [siteId] )`

Gets the current product page being viewed.

### `getProductsCurrentSearch( state, [siteId] )`

Gets the current product search term being viewed (if exists).

### `getProductsRequestedPage( state, [siteId] )`

Gets the requested/loading product page being viewed.

### `getProductsRequestedSearch( state, [siteId] )`

Gets the requested/loading product search term being viewed (if exists).

### `getProductEdits( state, productId, [siteId] )`

Gets the accumulated edits for a product, if any. `productId` can be a numeric ID for an existing product, or a placeholder ID for a to-be-created product.

### `getProductWithLocalEdits( state, productId, [siteId] )`

Gets a product with local edits overlaid on top of fetched data. `productId` can be a numeric ID for an existing product, or a placeholder ID for a to-be-created product.
