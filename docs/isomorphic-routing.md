Isomorphic Routing
==================

Isomorphic routing means that you define your routes (i.e. what middleware to
run for which path) only once, using them both on the client, and the server.

For an example of isomorphic routing, see `client/my-sites/themes`.

In order to enable isomorphic routing for a section, set `isomorphic: true`
for that section in `client/sections.js`.

The constraints required for isomorphic routing are:
* In `client/mysection/index.js`, export a default function that accepts
`router` as an argument. Instead of defining routes by invoking `page`, use
`router`, e.g.

```js
export default function( router ) {
  router( '/themes/:slug/:section?/:site_id?', details, makeLayout );
}
```

The contract is that at the end of each route's middleware chain, `context.layout`
should contain the React render tree to be rendered, which will be done magically
by either the client or the server render, as appropriate. (This is clearly
different from the previous client-side-only routing approach where you'd have
to render to `#primary`/`#secondary` DOM elements.)

To facilitate that, you can (but don't have to) use the `makeLayout`
generic middleware found in `client/controller`. So in the above example, the
details middleware will just create an element in `context.primary` (instead of
rendering it to the `#primary` DOM element, as previously).
Note that `makeLayout` cannot produce a logged-in `Layout` on the server side yet,
as that has a lot of dependencies that aren't ready for server-side rendering.

* Realistically, you will probably need to write separate `index.node.js` and
`index.web.js` files for the server and client side inside your section, as many
components needed on the client side aren't server-side ready yet. For more on
that, see [Server-side Rendering docs](server-side-rendering.md).
* Keep in mind that a lot of sections still render directly to the `#primary` and
`#secondary` `<div />`s. Unfortunately, React cannot handle switching between those
sections and a section that renders its entire component tree at once (a _single-tree
rendered_ section). For this reason, we have to unmount and re-render component
trees when switching between these two types of sections. We do this in a `page()`
handler in [`client/boot`](../client/boot/index.js). You'll have to locate that
handler and add your isomorphic section to the `singleTreeSections` array of allowed sections.
* Behind the scenes, we're using a [util](../server/isomorphic-routing/README.md) that adapts `page.js` style middleware to [Express](https://expressjs.com/en/guide/routing.html)',
our server router's middleware signatures. We might want to switch to an isomorphic
router in the future.

# Error Handling

We support error handling middleware on the server side. Among other things, this is
so that server-side rendered sections can set an HTTP error status, such as 404 if something isn't found.

An error handling middleware takes three instead of just two arguments, `err, context, next`.
Invoke it by adding it at the end of your route definitions:

```js
export function notFoundError( err, context, next ) {
	context.layout = (
		<ReduxProvider store={ context.store }>
			<LayoutLoggedOut primary={ <ThemeNotFoundError /> } />
		</ReduxProvider>
	);
	next( err );
}

export default function( router ) {
  router( '/themes/:slug/:section?/:site_id?', details, makeLayout, themeNotFound );
}
```

Note that you can have multiple error-handling middlewares in your route defintion. When any of the regular middlewares throw an error (or call `next(err)`), only error-handling will be called from that point. This is how error middleware chains skip regular middlewares. The endering middleware that is implicitly called on the server after all other middlewares are invoked uses `err.status` to set the HTTP error status. It will also log an error in the server log, using
severity `error` if status is >= 500, `info` otherwhise.

```js
function details( context, next ) ) {
  const theme = fetchThemeSomehow( context.params.slug );
  if ( ! theme ) {
    const err = {
      status: 404,
      message: 'Theme Not Found',
      context.params.slug
    };
	return next( err );
  }
  /* Render theme section */
  next();
  }
}
```
