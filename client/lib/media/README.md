Media
=====

Media is a set of stores and actions for interacting with the WordPress.com REST API media endpoints. The stores are modelled as Flux stores, and actions are made available to interact with the stores.

The Media store extends the EventEmitter interface and can be monitored for changes by binding to the `change` event.

## Stores

### MediaStore

This is the single source of truth for media data. As data flows through the Flux lifecycle, the latest version of media data for all sites is kept in-memory on the MediaStore object.

## Usage

The stores are singleton objects, which offer `get` and `getAll` methods to retrieve data.

```js
import MediaStoreFactory from 'lib/media/store';
const MediaStore = MediaStoreFactory();

const allMedia = MediaStore.getAll( siteId );
const singleMedia = MediaStore.get( siteId, postId );
```

To interact with the store, use the actions made available in `actions.js`.

```js
import MediaActions from 'lib/media/actions';

MediaActions.fetchNextPage( siteId );
```

You should monitor the store for changes in case another module interacts with the store:

```js
import MediaStore 'lib/media/store';
const mediaScale = MediaStore.get( 'media-scale' );

MediaStore.on( 'change', function() {
	mediaScale = MediaStore.get( 'media-scale' );
} );
```

### Controller-View

When using media data in the context of a component, it's recommended that you take advantage of the [`MediaListData` controller-view component](../../components/data/media-list-data/), which manages data retrieval on your behalf.
