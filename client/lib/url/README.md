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

- `addQueryArgs( url, args )` — adds or updates query parameters on any URL type (absolute, relative, protocol-relative).
- `withoutHttp( url )` — strips the `http://` or `https://` scheme from a URL string.
- `urlToSlug( url )` — converts a URL to a site slug (e.g. `https://example.com` → `example.com`).
- `urlToDomainAndPath( url )` — returns the domain + path portion of a URL, without the scheme.
- `urlToDomain( url )` — returns only the domain portion of a URL.
- `omitUrlParams( url, params )` — removes specified query parameters from a URL.
- `isExternal( url )` — returns `true` if the URL points outside of the current Calypso origin.
- `resemblesUrl( string )` — returns `true` if the string looks like a URL (has a domain suffix).
- `isOutsideCalypso( url )` — returns `true` if the URL points outside of Calypso (external or a legacy route).
- `isHttps( url )` — returns `true` if the URL uses the `https://` scheme.
- `addSchemeIfMissing( url, scheme )` — prepends a scheme to a URL that lacks one.
- `setUrlScheme( url, scheme )` — replaces the existing scheme of a URL.
- `decodeURIIfValid( uri )` — decodes a URI, returning the original string if decoding fails.
- `decodeURIComponentIfValid( component )` — decodes a URI component, returning the original string if decoding fails.
- `resolveRelativePath( basePath, relativePath )` — resolves a relative path against a base path.
- `pathToUrl( path )` — converts a Calypso path to a full absolute URL using the configured host.
