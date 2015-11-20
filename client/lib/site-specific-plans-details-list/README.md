site-specific-plans-details-list
================================

`site-specific-plans-details-list` is a collection of all the site specific data for the plans users can upgrade to on WordPress.com, as returned from the `/sites/:s/plans` REST-API endpoint. It can be required into a file like:

```
var siteSpecificPlansDetails = require( 'lib/site-specific-plans-details-list' )();
```

Currently site-specific-plans-details-list just has one public method, `get()`.

`get( siteDomain )`
This get method take the siteDomain (or ID) as a parameter. The get request will first check for data on the object itself, and if it finds data, will return that. Otherwise it will check localStorage through `store` for a `SiteSpecificPlansDetailsList` object, and will return the data for that specific site, or an empty object if null and immediately call the fetch method.
