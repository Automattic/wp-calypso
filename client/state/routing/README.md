Routing Middleware
==================

_As it stands, this piece of middleware does very little. It is unrelated to any potential future work on middleware-level routing in Calypso, but this module could be the place for it._


`restore-last-location`
-----------------------

This middleware implements the behavior — first seen in the WordPress.com desktop app — whereby a user starting a new session at `/` will be shown their last route recorded on that device, _e.g._ `/posts/my` or `/pages/example.wordpress.com`.

The implementation hinges on listening to `ROUTE_SET` actions and:

- Saving the action's path to localStorage
- If this is the middleware's first run and the application is being loaded at `/`, attempt to redirect to the path value found in localStorage.

Behavior will probably change or be fine-tuned in the future.
