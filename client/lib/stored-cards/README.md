stored-cards
=======

`stored-cards` is a collection of all the stored credit cards have saved on WordPress.com as returned from the `/me/stored_cards` REST-API endpoint. It can be required into a file like:

```
var storedCards = require( 'lib/stored-cards' )();
```

Currently stored cards just has two public methods, `get()`, and `fetch()`.

`get()`
The get request will first check for data on the object itself, and if it finds data, will return that. Otherwise it will check localStorage through `store` for a `StoredCards` object, and will return that data or an empty array if null and immediately call the fetch method.

`fetch()`
The fetch method will call out to the `/me/stored_cards` endpoint, store the results to the `StoredCards` object, emit a 'change' event, and store the new data to localStorage.
