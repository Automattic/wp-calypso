# Isomorphic Routing Middleware Adapters

## index.js

This module provides functions to adapt `page.js`-style middleware (with
`( context, next )` signature) to work with `express.js` (`( req, res, next )`),
so `client` middleware satisfying a couple of constraints can be re-used on the
server side.

For more information, see [Isomorphic Routing docs](docs/isomorphic-routing.md).
