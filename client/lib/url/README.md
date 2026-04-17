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

## Exported Utilities

- `addQueryArgs( args, url )` — Adds or updates query parameters on any type of URL (absolute, protocol-relative, path-absolute, or path-relative).
- `withoutHttp( url )` — Strips the `http://` or `https://` prefix from a URL.
- `urlToSlug( url )` — Converts a URL to a site slug by stripping the protocol and replacing slashes with `::`.
- `urlToDomainAndPath( url )` — Returns the domain and path of a URL, without the protocol or trailing slash.
- `urlToDomain( url )` — Returns only the domain of a URL, without the protocol or path.
- `omitUrlParams( url, paramsToOmit )` — Removes specified query parameters from a URL.
- `isExternal( url )` — Returns `true` if a URL points to a host other than the current Calypso instance.
- `resemblesUrl( query )` — Returns `true` if a string looks like a URL (has a domain with a dot-separated TLD).
- `isOutsideCalypso( url )` — Returns `true` if a URL is external or points to a non-Calypso path (e.g. `/support`, `/forums`).
- `isHttps( url )` — Returns `true` if a URL uses the `https://` scheme.
- `addSchemeIfMissing( url, scheme )` — Prepends a scheme (e.g. `https`) to a URL if it has none.
- `setUrlScheme( url, scheme )` — Replaces or adds the scheme of a URL.
- `decodeURIIfValid( encodedURI )` — Safely decodes a URI, returning the original string on error.
- `decodeURIComponentIfValid( encodedURIComponent )` — Safely decodes a URI component, returning the original string on error.
- `resolveRelativePath( basePath, relativePath )` — Resolves a relative path against an absolute base path.
- `pathToUrl( path )` — Converts an absolute path to a full URL using the Calypso hostname and protocol from config.
