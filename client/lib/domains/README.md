domains
-------

This module provides utility functions to deal with domain features.


DomainsStore
------------

`DomainsStore` is a module that manages **domains** for a specific site. More specifically, it allows to:

* Retrieve a list of domains belonging to a site
* Set the primary domain of a site
* Enable privacy protection for a domain
* Request a code to transfer a domain

It is modelled as a [Flux](https://facebook.github.io/flux/docs/overview.html) store, and follows the reducer pattern promoted by [Redux](http://rackt.org/redux/docs/basics/Reducers.html). Changes on the store can be monitored by binding to the `change` event. Finally actions are made available to interact with this store.

## Usage

The store is a singleton object which offers `get` and `getBySite` methods to retrieve data:

```js
import DomainsStore from 'lib/domains/store';

DomainsStore.get()
DomainsStore.getBySite( 'example.wordpress.com' )
```

To interact with the store, use the actions made available in [`domain-management.js`](../../upgrades/actions/domain-management.js):

```js
import * as upgradesActions from 'lib/upgrades/actions';

upgradesActions.fetchDomains( 'example.wordpress.com' );
upgradesActions.setPrimaryDomain( 'example.wordpress.com', 'example.com' );
upgradesActions.enablePrivacyProtection( { 'example.wordpress.com', 'example.com' } );
upgradesActions.requestTransferCode( { 'example.wordpress.com', 'example.com', true, true } );
```

## Unit Tests
For your tests to be included in the domains library test runner, you must require them in `client/lib/domains/test/index.js`.
Note that each `describe` block in this file should mirror the folder structure of domains library.
To run test runner go to `client/lib/domains` folder and execute `make test` command.
