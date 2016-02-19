sync-handler
===========

`sync-handler` is an abstraction layer used to sync the data that flowing between 
the client (calypso) and the server (WordPress.com REST-API). It works wrapping 
the request handler of the wpcom.js library which allows it intercept, handler 
and store any requests that the client does.

### How to use

```es6
import { SyncHandler } from 'lib/wp/sync-handler';
import wpcomUndocumented from 'lib/wpcom-undocumented';
import wpcomXHRHandler from 'lib/wpcom-xhr-wrapper';

// wrap the request handler with sync-handler
const handler = new SyncHandler( wpcomXHRHandler );

// create wpcom instance passing the wrapped handler
const wpcom = wpcomUndocumented( handler );
```

### Cache Invalidation

`cache-index` stores the key and timestamp for all records stored by the
`sync-handler` which allows us to prune records from our local cache. There are
two methods to invalidate records:

### syncHandler#pruneRecordsFrom( [lifetime] );
Prune records older than the given `lifetime` (milliseconds or [natural
language](https://github.com/rauchg/ms.js)). By default the value of the lifetime is `2 days`.

```es6
// prune the records that are older than one hour of life
syncHandler.pruneRecordsFrom( 1000 * 60 * 60 );

// prune older than 10 hours old
syncHandler
	.pruneRecordsFrom( '10 hours' )
	.then( records => {
		console.log( 'current records count: %s', records.length );
	} );
```

### syncHandler.clearAll();
clearAll the whole sync-handler data.

### Testing and Debug

In order to offer an API useful for testing and debug this module exposes two global vars: `syncHandler` and `cacheIndex`. It worth clarify that these ones are exposed only in the `development` environment.

#### `syncHandler`

It's the `SyncHandler` instance which wraps the wpcom request handler. You would  open the dev console in your browser and then make something like:

```es6
// add and then remove a testing record
syncHandler
  .storeRecord( 'testing-key', { description: 'testing record' } )
  .then( () => syncHandler.removeRecord( 'testing-key' ) );
```


#### `cacheIndex`

It allows access to `cache-index` API from the dev console. For instance:

```es6
// prune records older than 25 minutes of lifetime.
cacheIndex.pruneRecordsFrom( '25 minutes' );
```
