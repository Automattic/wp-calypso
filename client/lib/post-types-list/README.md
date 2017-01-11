post-types-list
===============

`post-types-list` is a collection for all post types for a site as returned from the `/sites/$site/post-types` REST API endpoint.

## Usage

When required into a file and invoked as a function, it will return a shared instance that is used throughout the project.

```js
var postTypesList = require( 'lib/post-types-list' )();
```

Or if you need a distinct instance:

```js
var PostTypesList = require( 'lib/post-types-list/list' ),
	postTypesList = new PostTypesList();
```

To retrieve the available data for a site, call the `get` method, passing a site ID:

```js
var postTypesList = require( 'lib/post-types-list' )(),
	postTypes = postTypesList.get( siteId );
```

Be aware that if data hasn't yet been fetched, you will receive an empty data set. You should watch the list for changes to keep up-to-date with the latest data:

```js
var postTypesList = require( 'lib/post-types-list' )(),
	postTypes = postTypesList.get( siteId );

postTypesList.on( 'change', function() {
	postTypes = postTypesList.get( siteId );
} );
```

If you're using this within the context of a React component, you can easily keep your rendered view up-to-date using the [`data-observe` mixin](../mixins/data-observe).
