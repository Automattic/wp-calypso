tags-list
===============

`tags-list` is a collection for all tags for a site, as returned from the `/sites/$site/tags` REST API endpoint. It implements the Pageable mixin.

## Usage

```js
var Tagslist = require( 'lib/tags-list' );
var tags = new TagsList( siteID );

tags.fetchNextPage();
```

## Methods

There are currently two public methods, `get()`, and `fetch( options, callback )`.

### `get()`

Returns all the tags currently stored.

### `fetch( options, callback )`

The fetch method makes a request to the `/sites/$site/tags` endpoint, and delegates response processing to `Pageable`'s `handleResponse`
