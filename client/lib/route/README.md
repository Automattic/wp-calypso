Route
=======

A few utilities that help when dealing with changing routes.

#### How to use?

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
````

If you want a different behavior, or more control over the redirect, `untrailingslashit` and
`redirect` are provided.

