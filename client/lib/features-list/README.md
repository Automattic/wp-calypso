features-list
=======

`features-list` is a collection of all the features for active plans on WordPress.com, as returned from the `/plans/features` REST-API endpoint. It can be required into a file like:

```
var features = require( 'lib/features-list' )();
```

Currently features just has two public methods, `get()`, and `fetch()`.

`get()`
The get request will first check for data on the object itself, and if it finds data, will return that. Otherwise it will check localStorage through `store` for a `FeaturesList` object, and will return that data or an empty array if null and immediately call the fetch method.

`fetch()`
The fetch method will call out to the `/features` endpoint, store the results to the `FeaturesList` object, emit a 'change' event, and store the new data to localStorage.
