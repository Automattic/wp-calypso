# lib/url

This library provides both generic and Calypso-specific utilities for handling URLs.

You may be able to use the `@automattic/calypso-url` module, so check there first.

## Migrating from Node's `url`

Node's `url` is deprecated and may be abandoned at any point in the future. As such, it shouldn't be
used on the server, and it should be avoided on the client as well, as the browserified version is
just as abandoned.

That functionality has been replaced with the native `URL` and `URLSearchParams`, which exist as
globals both in Node and in browsers (Calypso polyfills this functionality where needed).

Unfortunately, `URL` and `URLSearchParams` offer limited functionality compared to Node's `url`, with
the main difference being that they're only able to handle absolute URLs (e.g. `http://example.com`),
and not partial URLs (e.g., `//example.com`, `/path`).

`lib/url` is a collection of utilities built on top of `URL` and `URLSearchParams`, which aim to
offer a way of handling all types of URLs.

`lib/url` does not offer the same API as Node's `url`, instead attempting to fix some of its flaws.

**IMPORTANT NOTE**: URL part names are different between Node's `url` and `lib/url`. This is because
`lib/url` is aligned to the `URL` / `URLSearchParam` standard in detriment of the legacy API.

## Exported utilities

- `addQueryArgs` — add or update query string parameters on a URL
- `withoutHttp` — strip the `http://` or `https://` scheme from a URL
- `urlToSlug` — convert a URL to a slug (hostname + path, no protocol)
- `urlToDomainAndPath` — extract the domain and path from a URL
- `urlToDomain` — extract just the domain from a URL
- `omitUrlParams` — remove specific query parameters from a URL
- `isExternal` — check whether a URL points to an external site
- `resemblesUrl` — check whether a string looks like a URL
- `isOutsideCalypso` — check whether a URL points outside of the Calypso app
- `isHttps` — check whether a URL uses the HTTPS scheme
- `addSchemeIfMissing` — prepend a scheme to a URL if none is present
- `setUrlScheme` — replace the scheme on a URL
- `decodeURIIfValid` — decode a URI, returning the original string on failure
- `decodeURIComponentIfValid` — decode a URI component, returning the original string on failure
- `resolveRelativePath` — resolve a relative path against a base path
- `pathToUrl` — convert a filesystem-style path to a URL string
