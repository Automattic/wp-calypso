## Unreleased

- Expose the matched route pattern through the read-only `page.currentRoutePattern` getter.
- Treat a backslash before a closing parenthesis in a route group as escaping it, as path-to-regexp does, so parsing a route can no longer backtrack exponentially.

## 0.7.0

- Initial fork of page.js with conversion to ES module and ES syntax.
- Removed the `decodeURLComponents` option that was leading to buggy `ctx.querystring` values.
