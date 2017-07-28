Routing Middleware
==================

_As it stands, this piece of middleware does very little. It is unrelated to any potential future work on middleware-level routing in Calypso, but this module could be the place for it._


`routingMiddleware`
-----------------------

This middleware implements one part of the behavior — first seen in the WordPress.com desktop app — whereby a user starting a new session at `/` will be shown their last route recorded on that device, _e.g._ `/posts/my` or `/pages/example.wordpress.com`.

We listen for `ROUTE_SET` actions and save the action's path to localStorage if it meets certain conditions

The "restore" side is implemented in the [restore-last-path lib](/client/lib/restore-last-path) & initiated [during initial loading](/server/bundler/loader.js).

Behavior will probably change or be fine-tuned in the future.
