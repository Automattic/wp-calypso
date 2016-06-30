plans-list
=======

`plans-list` is a collection of all the active plans users can upgrade to on WordPress.com, as returned from the `/me/plans` REST-API endpoint. It can be required into a file like:

```
var plans = require( 'lib/plans-list' )();
```

Currently plans just has two public methods, `get()`, and `fetch()`.

`get()`
The get request will first check for data on the object itself, and if it finds data, will return that. Otherwise it will check localStorage through `store` for a `PlansList` object, and will return that data or an empty array if null and immediately call the fetch method.

`fetch()`
The fetch method will call out to the `/plans` endpoint, store the results to the `PlansList` object, emit a 'change' event, and store the new data to localStorage.

`getPlanBySlug( slug )`
Returns a plan from the current list which slug matches the searched term