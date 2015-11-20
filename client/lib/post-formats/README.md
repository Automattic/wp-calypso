Post Formats
============

Post Formats is a Flux module for interacting with the WordPress.com REST API site post formats endpoints. Actions are made available to interact with the store.

The Post Formats store extends the EventEmitter interface and can be monitored for changes by binding to the `change` event.

## Usage

The store is a singleton object, which offers a `get` method to retrieve data for a particular site.

```js
var PostFormatsStore = require( 'lib/post-formats/store' ),
	postFormats = PostFormatsStore.get( siteId );
```

To interact with the store, use the actions made available in `actions.js`.

```js
var PostFormatsActions = require( 'lib/post-formats/actions' );

PostFormatsActions.fetch( siteId );
```

You should monitor the store for changes in case another module causes the store to update itself:

```js
var PostFormatsStore = require( 'lib/post-formats/store' ),
	postFormats = PostFormatsStore.get( siteId );

PostFormatsStore.on( 'change', function() {
	postFormats = PostFormatsStore.get( siteId );
} );
```

### Controller-View

When using media data in the context of a component, it's recommended that you take advantage of the [`PostFormatsData` controller-view component](../../components/data/post-formats-data/), which manages data retrieval on your behalf.
