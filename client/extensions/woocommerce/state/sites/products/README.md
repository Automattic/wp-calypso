Products
========

This module is used to manage products for a site.

## Actions

### `createProduct( siteId, product, [successAction], [failureAction] )`

Create a product on the remote site via API. May also call action creator callbacks: successAction on successful product creation, or failureAction on an error.

## Reducer

A list of products as returned from the site's API, saved on a per-site basis.

## Selectors
