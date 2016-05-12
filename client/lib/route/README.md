Route
=======

A few utilities that help when dealing with changing routes.

### normalize

Sometimes you want to enforce a canonical URL to a resource. You can use `normalize`
as middleware to redirect any pathname ending in `/` to the same path minus the `/`.
For instance, to redirect `/foo/` to `/foo`:

```javascript
var normalize = require( 'lib/route/normalize' );
page('/foo/?', normalize, displayFoo );
```

Alternatively, to normalize all routes:
```javascript
var normalize = require( 'normalize' );
page( '*', normalize );
```

If you want a different behavior, or more control over the redirect, `untrailingslashit` and
`redirect` are provided.

### addQueryArgs
This module is meant to simplify the work of adding query arguments to a URL.

#### Parameters
- `args` (object)(Required) – The first parameter is an object of query arguments to be added to the URL.
- `url` (string)(Required) – The second parameter is the original URL to add `args` to.


#### Example
```
import addQueryArgs from 'lib/route/add-query-args';

addQueryArgs( { foo: 'bar' }, 'https://wordpress.com' );             // https://wordpress.com?foo=bar
addQueryArgs( { foo: 'bar' }, 'https://wordpress.com?search=test' ); // https://wordpress.com/?search=test&foo=bar 
```
