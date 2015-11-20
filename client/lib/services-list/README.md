Services List
=============

`services-list` is a collection of the external services which are supported by WordPress.com Keyring.

For more information about how this data is used in Calypso, refer to the [sharing connections components README](../../my-sites/sharing/connections/README.md).

## Usage

When required into a file and invoked as a function, it will return a shared instance that is used throughout the project.

```js
var servicesList = require( 'lib/services-list' )();
```

Or if you need a distinct instance:

```js
var ServicesList = require( 'lib/services-list/list' ),
	servicesList = new ServicesList();
```

To retrieve the available data for a site, call the `get` method:

```js
var servicesList = require( 'lib/services-list' )(),
	postTypes = servicesList.get();
```

Be aware that if data hasn't yet been fetched, you will receive an empty data set. You should watch the list for changes to keep up-to-date with the latest data:

```js
var servicesList = require( 'lib/services-list' )(),
	postTypes = servicesList.get();

servicesList.on( 'change', function() {
	postTypes = servicesList.get();
} );
```

If you're using this within the context of a React component, you can easily keep your rendered view up-to-date using the [`data-observe` mixin](../mixins/data-observe).
