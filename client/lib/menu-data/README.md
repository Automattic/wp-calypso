menu-data
==========

Acts as a kind of "store" interface for the Menus UI, handling data from the REST API.

```js
var siteMenus = require( 'lib/menu-data' );
```

By default, this is a singleton interface that reacts to site changes, so that any read/write operations called on it concern the currently selected site in Calypso.
