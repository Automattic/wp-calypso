# lib/url

This library provides both generic and Calypso-specific utilities for handling URLs.

You may be able to use the `@automattic/calypso-url` module, so check there first.

## Exported utilities

| Export | Description |
|---|---|
| `addQueryArgs` | Adds or updates query parameters on any URL type (absolute, protocol-relative, path-absolute, or path-relative) |
| `withoutHttp` | Strips the `http://` or `https://` scheme from a URL |
| `urlToSlug` | Converts a URL to a site slug by removing the scheme and replacing `/` with `::` |
| `urlToDomainAndPath` | Removes the protocol and trailing slash from a URL |
| `urlToDomain` | Removes the protocol and path, returning only the domain |
| `omitUrlParams` | Removes specified query parameters from a URL |
| `isExternal` | Returns `true` if the URL points outside the current Calypso instance |
| `resemblesUrl` | Returns `true` if the string looks like a valid URL |
| `isOutsideCalypso` | Returns `true` if the URL is external or points to a path not handled by Calypso (e.g. `/support`, `/forums`) |
| `isHttps` | Returns `true` if the URL uses the `https://` scheme |
| `addSchemeIfMissing` | Prepends a scheme to a URL if one is not already present |
| `setUrlScheme` | Replaces the scheme of a URL with the given scheme |
| `decodeURIIfValid` | Safe wrapper around `decodeURI` that swallows `URIError` on invalid input |
| `decodeURIComponentIfValid` | Safe wrapper around `decodeURIComponent` that swallows `URIError` on invalid input |
| `resolveRelativePath` | Resolves a relative path against an absolute base path |
| `pathToUrl` | Converts a Calypso-relative path to a full absolute URL using the configured hostname |

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
