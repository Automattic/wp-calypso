# Isomorphic Routing Helpers

Provides middleware to be used agnostically with either `page.js`, or with
`express` (through middleware adapters found in `server/`). Since some of the
middleware needs to function differently on the server than on the client,
both versions are provided transparently in those cases (by `index.web.js` and
`index.node.js`, respectively.)

These middlewares include:

- `makeLayout`: creates a `Layout` (or `LayoutLoggedOut`) component in `context.layout`.
  Accepts `primary` and `secondary` arguments which it will use to populate the corresponding `<div>`s.
- `clientRouter`: Essentially an alias for `page`, which invokes a client-side
  `render` middleware after all other middlewares.
