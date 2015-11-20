connections-list
================

`connections-list` is a collection of all user and site connections as returned from the `/v1.1/me/keyring-connections` and `/v1.1/sites/$site/publicize-connections` REST API endpoints.

For more information about how this data is used, refer to the [sharing connections components README](../../my-sites/sharing/connections/README.md).

## Usage

When required into a file and invoked as a function, it will return a shared instance that is used throughout the project.

```js
var connectionsList = require( 'lib/connections-list' )();
```

Or if you need a distinct instance:

```js
var ConnectionsList = require( 'lib/connections-list/list' ),
	connectionsList = new ConnectionsList();
```

To retrieve the available Keyring connection data for the current user, call the `get` method without a site ID:

```js
var connectionsList = require( 'lib/connections-list' )(),
	keyringConnections = connectionsList.get();
```

To retrieve the available Publicize connections for a user on a given site, call the `get` method and include a site ID:

```js
var connectionsList = require( 'lib/connections-list' )(),
	publicizeConnections = connectionsList.get( siteId );
```

Be aware that if data hasn't yet been fetched, you will receive an empty data set. You should watch the list for changes to keep up-to-date with the latest data:

```js
var connectionsList = require( 'lib/connections-list' )(),
	connections = connectionsList.get( siteId );

connectionsList.on( 'change', function() {
	connections = connectionsList.get( siteId );
} );
```

If you're using this within the context of a React component, you can easily keep your rendered view up-to-date using the [`data-observe` mixin](../mixins/data-observe).
