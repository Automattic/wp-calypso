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

- `addQueryArgs` — adds or merges query parameters into a URL, handling absolute, protocol-relative, and path-relative URLs
- `withoutHttp` — strips the `http://` or `https://` prefix from a URL
- `urlToSlug` — converts a URL to a Calypso site slug by removing the protocol and replacing slashes with `::`
- `urlToDomainAndPath` — removes the protocol prefix and trailing slash from a URL
- `urlToDomain` — removes the protocol and any path from a URL, returning only the domain
- `omitUrlParams` — removes one or more query parameters from a URL
- `isExternal` — returns `true` if a URL points to a hostname other than the current Calypso instance
- `resemblesUrl` — returns `true` if a string looks like a URL (has a valid hostname with a TLD)
- `isOutsideCalypso` — returns `true` if a URL is external or points to a non-Calypso path (e.g. `/support`, `/forums`)
- `isHttps` — returns `true` if a URL uses the `https://` scheme
- `addSchemeIfMissing` — prepends a scheme to a URL that has no scheme
- `setUrlScheme` — replaces or adds the scheme of a URL
- `decodeURIIfValid` — safely decodes a URI string, returning the original value on failure instead of throwing
- `decodeURIComponentIfValid` — safely decodes a URI component, returning the original value on failure instead of throwing
- `resolveRelativePath` — resolves a relative path segment against an absolute base path
- `pathToUrl` — converts a Calypso-relative path to a full URL using the configured hostname and protocol
