SiteRedirectStore
-----------------

`SiteRedirectStore` is a module that manages **site redirect settings** for a specific site. More specifically, it allows to retrieve and update the location of a Site Redirect upgrade. It is modelled as a [Flux](https://facebook.github.io/flux/docs/overview.html) store, and follows the reducer pattern promoted by [Redux](http://redux.js.org/docs/basics/Reducers.html). Changes on the store can be monitored by binding to the `change` event. Finally actions are made available to interact with this store.

## Usage

The store is a singleton object which offers `get` and `getBySite` methods to retrieve data:

```js
import SiteRedirectStore from 'lib/domains/site-redirect/store';

SiteRedirectStore.get()
SiteRedirectStore.getBySite( 'example.wordpress.com' )
```

To interact with the store, use the actions made available in [`domain-management.js`](../../upgrades/actions/domain-management.js):

```js
import * as upgradesActions from 'lib/upgrades/actions';

upgradesActions.closeSiteRedirectNotice( 'example.wordpress.com' );
upgradesActions.fetchSiteRedirect( 'example.wordpress.com' );
upgradesActions.updateSiteRedirect( 'example.wordpress.com', 'example.com' );
```
