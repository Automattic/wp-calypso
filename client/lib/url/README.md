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

- **`addQueryArgs( args, url )`** — merges an object of query parameters into a URL, supporting all URL types (absolute, protocol-relative, path-absolute, path-relative).
- **`withoutHttp( url )`** — strips the `http://` or `https://` scheme prefix from a URL.
- **`urlToSlug( url )`** — converts a URL to a site slug by stripping the scheme and replacing `/` with `::`.
- **`urlToDomainAndPath( url )`** — strips the protocol and trailing slash from a URL, returning the domain and path.
- **`urlToDomain( url )`** — strips the protocol and path from a URL, returning only the domain.
- **`omitUrlParams( url, params )`** — removes the specified query parameter(s) from a URL.
- **`isExternal( url )`** — returns `true` if the URL points to a host other than the current Calypso instance.
- **`resemblesUrl( query )`** — returns `true` if the string appears to be a URL (has a valid-looking hostname and TLD).
- **`isOutsideCalypso( url )`** — returns `true` if the URL is external or points to a non-Calypso path on the same domain (e.g. `/support`, `/forums`).
- **`isHttps( url )`** — returns `true` if the URL uses the `https://` scheme.
- **`addSchemeIfMissing( url, scheme )`** — prepends the given scheme to a URL that has no scheme.
- **`setUrlScheme( url, scheme )`** — replaces the existing scheme on a URL, or adds the given scheme if none is present.
- **`decodeURIIfValid( encodedURI )`** — safely wraps `decodeURI`, returning the original string instead of throwing on invalid input.
- **`decodeURIComponentIfValid( encodedURIComponent )`** — safely wraps `decodeURIComponent`, returning the original string instead of throwing on invalid input.
- **`resolveRelativePath( basePath, relativePath )`** — resolves a relative path against an absolute base path.
- **`pathToUrl( path )`** — converts a Calypso-relative path to a full URL using the configured hostname and protocol.
