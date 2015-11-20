Sharing Buttons List
====================

`sharing-buttons-list` is a collection of enabled and available sharing buttons for a particular site.

## Usage

When required into a file and invoked as a function, it will return a shared instance that is used throughout the project.

```js
var sharingButtonsList = require( 'lib/sharing-buttons-list' )();
```

Or if you need a distinct instance:

```js
var SharingButtonsList = require( 'lib/sharing-buttons-list/list' ),
	sharingButtonsList = new SharingButtonsList();
```

To retrieve the sharing buttons data for a specific site, call the `get` method with a site ID:

```js
var sharingButtonsList = require( 'lib/sharing-buttons-list' )(),
	buttons = sharingButtonsList.get( siteId );
```

Be aware that if data hasn't yet been fetched, you will receive an empty data set. You should watch the list for changes to keep up-to-date with the latest data:

```js
var sharingButtonsList = require( 'lib/sharing-buttons-list' )(),
	buttons = sharingButtonsList.get( siteId );

sharingButtonsList.on( 'change', function() {
	buttons = sharingButtonsList.get( siteId );
} );
```

If you're using this within the context of a React component, you can easily keep your rendered view up-to-date using the [`data-observe` mixin](../mixins/data-observe).
