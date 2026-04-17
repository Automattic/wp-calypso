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

| Export | Description |
|---|---|
| `addQueryArgs( args, url )` | Merges query parameters into a URL, supporting absolute, protocol-relative, path-absolute, and path-relative URLs. |
| `withoutHttp( url )` | Strips the `http://` or `https://` prefix from a URL. |
| `urlToSlug( url )` | Converts a URL to a site slug by removing the protocol and replacing `/` with `::`. |
| `urlToDomainAndPath( url )` | Removes the protocol and trailing slash, returning `domain/path`. |
| `urlToDomain( url )` | Removes the protocol and path, returning only the domain. |
| `omitUrlParams( url, params )` | Removes one or more query parameters from a URL. |
| `isExternal( url )` | Returns `true` if the URL points outside the current Calypso hostname. |
| `resemblesUrl( query )` | Returns `true` if the string looks like a URL (has a valid hostname with a TLD). |
| `isOutsideCalypso( url )` | Returns `true` if the URL is external or points to a non-Calypso path (e.g. `/support`, `/forums`). |
| `isHttps( url )` | Returns `true` if the URL uses the `https://` scheme. |
| `addSchemeIfMissing( url, scheme )` | Prepends `scheme://` to a URL if no scheme is present. |
| `setUrlScheme( url, scheme )` | Replaces the existing scheme of a URL with the given one. |
| `decodeURIIfValid( uri )` | Safely decodes a URI string, returning the original value if decoding fails. |
| `decodeURIComponentIfValid( component )` | Safely decodes a URI component, returning the original value if decoding fails. |
| `resolveRelativePath( basePath, relativePath )` | Resolves a relative path against an absolute base path. |
| `pathToUrl( path )` | Converts a Calypso path to a full URL using the current environment config. |
