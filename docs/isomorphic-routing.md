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
to render to `#primary`/`#secondary`/`#tertiary` DOM elements.)

To facilitate that, you can (but don't have to) use the `makeLayout`
generic middleware found in `client/controller`. So in the above example, the
details middleware will just create an element in `context.primary` (instead of
rendering it to the `#primary` DOM element, as previously).
Note that `makeLayout` cannot produce a logged-in `Layout` on the server side yet,
as that has a lot of dependencies that aren't ready for server-side rendering.

* Realistically, you will probably need to write separate `index.node.js` and
`index.web.js` files for the server and client side inside your section, as many
components needed on the client side aren't server-side ready yet. For more on
that, see [Server-side Rendering docs](/docs/server-side-rendering.md).
