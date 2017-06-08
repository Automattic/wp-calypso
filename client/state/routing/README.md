Routing Middleware
==================

This middleware listens to `ROUTE_TO` actions and as a side-effect calls 
our current router, [Page.js](https://visionmedia.github.io/page.js/)
to navigate to that route. 

There are several benefits to dispatching a `ROUTE_TO` action instead of calling `page()` directly. 
1. Provides clear intent
2. Abstracts out router details, so we can more easily change router implementations.
3. Easier to test, since we can verify that an action was dispatched.


`restore-last-location`
-----------------------

This middleware implements the behavior — first seen in the WordPress.com desktop app — whereby a user starting a new session at `/` will be shown their last route recorded on that device, _e.g._ `/posts/my` or `/pages/example.wordpress.com`.

The implementation hinges on listening to `ROUTE_SET` actions and:

- Saving the action's path to localStorage
- If this is the middleware's first run and the application is being loaded at `/`, attempt to redirect to the path value found in localStorage.

Behavior will probably change or be fine-tuned in the future.
