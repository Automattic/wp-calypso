sites-list
==========

`sites-list` is a collection for all the sites owned by a user as returned from the `/me/sites` REST-API endpoint. It can be required into a file like this, which will return a shared instance that is used throughout Calypso:

```js
var sites = require( 'lib/sites-list' )();
```

If for some reason, you need to a distinct instance,

```js
var SitesList = require( 'lib/sites-list/list' );
var sites = new SitesList();
```

Two important public methods are `get()` and `fetch()`:

`get()`
The get request will first check for data on the object itself, and if it finds data, will return that. Otherwise it will check localStorage through `store` for a `SitesList` object, and will return that data or an empty array if null and immediately call the fetch method.

`fetch()`
The fetch method will call out to the `/me/sites` endpoint, store the results to the `SitesList` object, emit a 'change' event, and store the new data to localStorage.

Further methods exist for inspecting and manipulating sites.

---

This folder also contains some further site-related modules:

#### actions.js

Provides Flux actions for deleting sites, disconnecting sites, and clearing site notices.

#### log-store.js

Flux store providing the site-related messages for `notices.js`. Works with the actions in `actions.js.`

#### notices.js

A mixin that displays site information and error notices via the [notices](/client/notices) module.
