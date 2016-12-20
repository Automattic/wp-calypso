Domains WHOIS
=============

This module provides utility functions to deal with domain WHOIS features.

### WhoisStore

`WhoisStore` is a module that manages **WHOIS** for a specific domain. More specifically, it allows to:

* Retrieve a contact information for a domain
* Update a contact information for a domain

It is modelled as a [Flux](https://facebook.github.io/flux/docs/overview.html) store and follows the reducer pattern promoted by [Redux](http://redux.js.org/docs/basics/Reducers.html). Changes on the store can be monitored by binding to the `change` event. Finally actions are made available to interact with this store.

## Usage

The store is a singleton object which offers `get` and `getByDomainName` methods to retrieve data:

```js
import WhoisStore from 'lib/domains/whois/store';

WhoisStore.get()
WhoisStore.getByDomainName( 'example.wordpress.com' )
```

To interact with the store, use the actions made available in [`domain-management.js`](../../upgrades/actions/domain-management.js):

```js
import * as upgradesActions from 'lib/upgrades/actions';

upgradesActions.fetchWhois( 'example.wordpress.com' );
upgradesActions.updateWhois( 'example.wordpress.com', contactInformationData, true, onCompleteCallback );
```
