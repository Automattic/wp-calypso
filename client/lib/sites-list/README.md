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

#### delete-site-store.js

Flux store holding the last deleted site. Works with the `delete` actions in `actions.js.`

#### log-store.js

Flux store providing the site-related messages for `notices.js`. Works with the actions in `actions.js.`

#### notices.js

A mixin that displays site information and error notices via the [notices](/client/notices) module.

#### sites-observer.jsx

A High-Order-Component that mimic the functionality of `data-observer` only specific to SitesList. It listens to `change` event of SitesList and creates a new object that uses the original `SitesList` as prototype thus both `PureComponent` and `react-redux` `connect` are able to detect the data was changed even though `SitesList` mutate in-place.

This component is designed to wrap any React Component or `react-redux` `connect` High-Order-Components that expect to get `sites` prop.

This component expects to get `sites` prop and it passes to the component it wraps `sites` prop that will behave correctly for PureComponent.

```
import sitesObserver from 'lib/sites-list/sites-observer';

export default sitesObserver(
    connect( mapStateToProps, { setNextLayoutFocus, setLayoutFocus } )( localize( MySitesSidebar ) )
);
```
