Product Categories
==================

This module is used to manage product categories for a site.

## Actions

### `fetchProductCategories( siteId: number )`

Get the list of product categories from the remote site.

## Reducer

A list of settings as returned from the site's API, saved on a per-site basis.

```js
{
	"productCategories": [ {
		"id": 10
		"name": "Watercolor"
		"slug": "watercolor"
		"parent": 0
		"description": ""
		"display": "default"
		"image": []
		"menu_order": 0
		"count": 2
	}, { … } ]
}
```

## Selectors

### `getProductCategories( state, siteId: number )`

Get the list of categories from a given site, or an empty array if nothing's there yet.
