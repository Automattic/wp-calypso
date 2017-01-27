Server-side Rendering
=====================

Server-side rendering is great for SEO, as well as progressive enhancement. When rendering on the server, we have a special set of constraints that we need to follow when building components and libraries.

tl;dr: Don't depend on the DOM/BOM; make sure your initial render is synchronous; don't mutate class variables; add a test to `renderToString` your server-side rendered page.

#### React Components

React components used on the server will be rendered to HTML by being passed to a [renderToString()](https://facebook.github.io/react/docs/top-level-api.html#reactdomserver.rendertostring) call, which calls `componentWillMount()` and `render()` _once_. This means that any components used by a server-side rendered section need to satisfy the following constraints:
* Must not rely on event handling for the initial render.
* Must not hook up any change listeners, or do anything asynchronous, inside `componentWillMount()`.
* All data must be available before the initial render.
* Mutating class-level variables should be avoided, as they will be persisted until a server restart.
* Must not change component ID during `componentWillMount`.
* Must not assume that the DOM/BOM exists in `render()` and `componentWillMount()`.

#### Libraries

* Libraries that are used on the server should be mindful of the DOM not being available on the server, and should either: be modified to work without the DOM; have non-DOM specific fallbacks; or fail in an obvious manner.
* Singletons should be avoided, as once instantiated they will persist for the entire duration of the `node` process.

### Tests

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

If you know that your code will never be called on the server, you can stub-out the module using `NormalModuleReplacementPlugin` in the [config file](https://github.com/Automattic/wp-calypso/blob/master/webpack.config.node.js), and make the same change in the Desktop [config](https://github.com/Automattic/wp-desktop/blob/master/webpack.shared.js).

### Debugging

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
