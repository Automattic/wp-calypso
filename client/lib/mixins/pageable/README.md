pageable
===============

`pageable` is a mixin to help with paging collections returned from the WordPress.com REST endpoints.

## Usage

```js
var Pageable = require( 'lib/mixins/pageable' );

Pageable( YourCollection.prototype )

yourCollection = new YourCollection( [siteID] );
yourCollection.fetchNextPage();
```

## Requirements

* `siteID` must be an instance variable
* `data` must be an instance variable, and an array
* `perPage` must be an instance variable specifying how many items to fetch per page
* `fetch` and `parse` must be implemented in `YourCollection` - see the JSDocs for more detail
* Your endpoint must support the `page` parameter, and its response should contain a `found` property, for number of items found.

## Methods

### `fetchNextPage()`

Fetches the next page of `YourCollection`. Sets the `fetchingNextPage` instance property to true whilst fetching.

