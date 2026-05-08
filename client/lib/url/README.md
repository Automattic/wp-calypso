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

- `addQueryArgs` — Merges query parameters into a URL, supporting all URL types (absolute, protocol-relative, path-absolute, and path-relative).
- `withoutHttp` — Strips the `http://` or `https://` scheme from a URL.
- `urlToSlug` — Converts a URL to a Calypso site slug by stripping the scheme and replacing `/` with `::`.
- `urlToDomainAndPath` — Removes the `http(s)://` prefix and trailing slash, returning the domain and path.
- `urlToDomain` — Removes the `http(s)://` prefix and all trailing slashes, returning only the domain.
- `omitUrlParams` — Removes specified query parameters from a URL.
- `isExternal` — Returns `true` if the URL points to a host other than the current Calypso instance.
- `resemblesUrl` — Returns `true` if a string looks like a URL (has a valid hostname with a TLD).
- `isOutsideCalypso` — Returns `true` if the URL is external or points to a path served outside Calypso (e.g. `/support`, `/forums`).
- `isHttps` — Returns `true` if the URL uses the `https://` scheme.
- `addSchemeIfMissing` — Prepends a scheme to a URL if none is present.
- `setUrlScheme` — Replaces the scheme of a URL, or adds it if absent.
- `decodeURIIfValid` — Safely decodes a URI string, returning the original value on invalid input.
- `decodeURIComponentIfValid` — Safely decodes a URI component string, returning the original value on invalid input.
- `resolveRelativePath` — Resolves a relative path against an absolute base path.
- `pathToUrl` — Converts an absolute path to a full URL using the current Calypso hostname configuration.
