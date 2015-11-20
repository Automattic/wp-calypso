States List
==============

The `states-list` module provides access to localized list of states as returned from the REST API. These lists are ordered alphabetically.

## Usage

The list of supported states for domain registrations can be retrieved with:

```js
var statesList = require( 'lib/states-list' ).forDomainRegistrations();
```

## Methods

The following public methods are available:

### `fetchForCountry( countryCode )`

This fetches the corresponding list of states from the server. The list is cached in the store upon retrieval.

### `getForCountry( countryCode )`

This retrieves the list of states as a set of key and value pairs. The list is loaded from the store and then fetched once from the server to update any stale data.

### `hasLoadedFromServer()`

This determines whether the list of states has already been loaded from the server or not.
