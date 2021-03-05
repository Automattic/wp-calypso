# Server-side Rendering

Server-side rendering is great for SEO, as well as progressive enhancement. When rendering on the server, we have a special set of constraints that we need to follow when building components and libraries.

tl;dr: Don't depend on the DOM/BOM; make sure your initial render is synchronous; don't mutate class variables; add a test to `renderToString` your server-side rendered page.

## React Components

React components used on the server will be rendered to HTML by being passed to a [renderToString()](https://facebook.github.io/react/docs/top-level-api.html#reactdomserver.rendertostring) call, which calls `componentWillMount()` and `render()` _once_. This means that any components used by a server-side rendered section need to satisfy the following constraints:

- Must not rely on event handling for the initial render.
- Must not hook up any change listeners, or do anything asynchronous, inside `componentWillMount()`.
- All data must be available before the initial render.
- Mutating class-level variables should be avoided, as they will be persisted until a server restart.
- Must not change component ID during `componentWillMount`.
- Must not assume that the DOM/BOM exists in `render()` and `componentWillMount()`.

## Libraries

- Libraries that are used on the server should be mindful of the DOM not being available on the server, and should either: be modified to work without the DOM; have non-DOM specific fallbacks; or fail in an obvious manner.
- Singletons should be avoided, as once instantiated they will persist for the entire duration of the `node` process.

## Caching

Because it is necessary to serve the redux state along with a server-rendered page, we use two levels of cache on the server: one to store the redux state, and one to store rendered layouts.

### Data Cache

At render time, the Redux state is [serialized and cached](../server/render/index.js), using the current path as the cache key, unless there is a query string, in which case we don't cache.

This means that all data that was fetched to render a given page is available the next time the corresponding route is hit. A section controller thus only needs to check if the required data is available (using selectors), and dispatch the corresponding fetching action if it isn't; see the [themes controller](../client/my-sites/themes/controller.jsx) for an example.

### Render Cache

There is a [shared cache](../server/render/index.js) for rendered layouts. There are some requirements for using this cache:

1. Cache entries need a way to expire
2. Multiple paths resulting in the same rendered content should ideally map to one cache entry

These requirements are met by allowing controllers to set a key for a request in `context.renderCacheKey`. For item (1) the timestamp from the data cache is added to the request path, so a path such as `/theme/mood/overview` results in a key of `/theme/mood/overview1485514728996`. When the associated data cache entry gets a new timestamp, the server cache entry will no longer get any hits and drop out of the cache.

Item (2) is solved by using an error string for the render cache key. For example, any invalid path such as `/theme/invalid` or `/theme/invalid/support` results in setting `context.renderCacheKey` to `theme not found`, meaning that the 404 page is always ready to serve and takes up only one cache slot.

If `context.renderCacheKey` is not set, stringified `context.layout` is used as the key.

When working with the SSR cache, turning on the [debug](#debugging) is very useful.

## Tests

In order to ensure that no module down the dependency chain breaks server-side rendering of your Calypso section or page, you should add a test to `renderToString` it. This way, when another developer modifies a dependency of your section in a way that would break server-side rendering, they'll be notified by a failed test.

### Run different code on the client

Occasionally, it may be necessary to conditionally do something client-specific inside an individual source file. This is quite useful for libraries that are heavily DOM dependent, and require a different implementation on the server. Don't do this for React components, as it will likely cause reconciliation errors — factor out your dependencies instead.

Here's how your module's `package.json` should look, if you really want to do this:

```
{
	"main": "index.node.js",
	"browser": "index.web.js"
}
```

### Stubbing a module on the server side

If you know that your code will never be called on the server, you can stub-out the module using `NormalModuleReplacementPlugin` in the [config file](https://github.com/Automattic/wp-calypso/blob/HEAD/webpack.config.node.js), and make the same change in the Desktop [config](https://github.com/Automattic/wp-desktop/blob/HEAD/webpack.shared.js).

## Debugging

To view hits and misses on the server render cache, use the following command (or platform equivalent) in the build console:

`export DEBUG="calypso:server-render"`

Sample debug output:

```
  calypso:server-render cache access for key +0ms /theme/mood1485514728996
  calypso:server-render cache miss for key +1ms /theme/mood1485514728996
  calypso:server-render Server render time (ms) +109ms 110
GET /theme/mood 200 1054.730 ms - 142380
GET /calypso/style-debug.css?v=4743a0b522 200 18.408 ms - 1290419
GET /calypso/vendor.development.js?v=147ad937b5 200 78.293 ms - 1778120
HEAD /version?1485514730526 200 1.057 ms - 20
  calypso:server-render cache access for key +5s /theme/mood1485514728996
  calypso:server-render Server render time (ms) +1ms 1
GET /theme/mood 200 198.760 ms - 140909
```

### I want to server-side render my components!

Awesome! Have a look at the [Isomorphic Routing](isomorphic-routing.md) docs to see how to achieve this. In addition, there are a couple of things you'll need to keep in mind: if your components need dynamic data, we'll need to cache; `renderToString` is synchronous, and will affect server response time; you should add a test to your section that ensures that it can really be rendered with `renderToString`; if you want to SSR something logged in, dependency nightmares will ensue.

Please ping @ehg, @mcsf, @ockham, or @seear if you're thinking of doing this, or if you have any questions. :)
