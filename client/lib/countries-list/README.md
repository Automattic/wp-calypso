Countries List
==============

The `countries-list` module provides access to localized list of countries as returned from the REST-API. These lists are ordered alphabetically with a list of favorite countries at the top.

## Usage

The list of supported countries for domain registrations can be retrieved with:

```js
var countriesList = require( 'lib/countries-list' ).forDomainRegistrations();
```

The list of supported countries for payments can be retrieved with:

```js
var countriesList = require( 'lib/countries-list' ).forPayments();
```

## Methods

The following public methods are available:

### `fetch()`

This fetches the corresponding list of countries from the server. The list is cached in the store upon retrieval.

### `get()`

This retrieves the list of countries as a set of key and value pairs. The list is loaded from the store and then fetched once from the server to update any stale data.

### `hasLoadedFromServer()`

This determines whether the list of countries has already been loaded from the server or not.
