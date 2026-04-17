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

- **`addQueryArgs( args, url )`** — adds or updates query string parameters on any URL type (absolute, protocol-relative, path-absolute, or path-relative).
- **`omitUrlParams( url, paramsToOmit )`** — removes one or more query parameters from a URL.
- **`withoutHttp( url )`** — strips the `http://` or `https://` prefix from a URL.
- **`urlToSlug( url )`** — converts a URL to a Calypso site slug (replaces `/` separators with `::`).
- **`urlToDomainAndPath( url )`** — returns the domain and path of a URL, stripping the protocol and trailing slash.
- **`urlToDomain( url )`** — returns only the domain of a URL, stripping the protocol and path.
- **`isExternal( url )`** — returns `true` if the URL points outside the current Calypso hostname.
- **`isOutsideCalypso( url )`** — returns `true` if the URL is external or points to a non-Calypso path (e.g. `/support`, `/forums`).
- **`isHttps( url )`** — returns `true` if the URL uses the `https://` scheme.
- **`addSchemeIfMissing( url, scheme )`** — prepends a scheme (e.g. `https`) to a URL that has none.
- **`setUrlScheme( url, scheme )`** — replaces the existing scheme of a URL, or adds one if missing.
- **`decodeURIIfValid( encodedURI )`** — safely decodes a URI, returning the original string on error.
- **`decodeURIComponentIfValid( encodedURIComponent )`** — safely decodes a URI component, returning the original string on error.
- **`resolveRelativePath( basePath, relativePath )`** — resolves a relative path against an absolute base path.
- **`pathToUrl( path )`** — converts an absolute path to a full URL using the configured Calypso hostname and protocol.
