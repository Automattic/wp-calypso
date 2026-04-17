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

- `addQueryArgs( args, url )` — merges a key/value object of query arguments into a URL, preserving the original URL type (absolute, protocol-relative, path-absolute, or path-relative).
- `withoutHttp( url )` — strips the `http://` or `https://` prefix from a URL.
- `urlToSlug( url )` — converts a URL to a site slug by stripping the protocol and replacing `/` with `::`.
- `urlToDomainAndPath( url )` — removes the protocol and trailing slash, returning the domain plus path.
- `urlToDomain( url )` — removes the protocol and any path, returning just the domain.
- `omitUrlParams( url, paramsToOmit )` — removes one or more query parameters from a URL.
- `isExternal( url )` — returns `true` if the URL points to a host other than the current Calypso instance.
- `resemblesUrl( query )` — heuristic check for whether a string looks like a URL (has a dot-separated hostname with a valid TLD).
- `isOutsideCalypso( url )` — returns `true` if the URL is external or targets a non-Calypso path (e.g. `/support`, `/forums`).
- `isHttps( url )` — returns `true` if the URL uses the `https://` scheme.
- `addSchemeIfMissing( url, scheme )` — prepends `<scheme>://` to a URL that has no scheme.
- `setUrlScheme( url, scheme )` — replaces or adds the scheme of a URL.
- `decodeURIIfValid( encodedURI )` — safe wrapper around `decodeURI` that returns the original string on `URIError`.
- `decodeURIComponentIfValid( encodedURIComponent )` — safe wrapper around `decodeURIComponent` that returns the original string on `URIError`.
- `resolveRelativePath( basePath, relativePath )` — resolves a relative path segment against an absolute base path.
- `pathToUrl( path )` — converts a Calypso-relative path to a full URL using the configured hostname and protocol.
