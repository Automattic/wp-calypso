# lib/url

This library provides both generic and Calypso-specific utilities for handling URLs.

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

## Overview of generic functionality

Here is a short summary of the different functionality in `lib/url`:

- Determine the type for a URL: `determineUrlType` (e.g. `'ABSOLUTE'` or `'SCHEME_RELATIVE'`).
- Split a URL into its parts: `getUrlParts`.
- Create an absolute URL based on its parts: `getUrlFromParts`.
- Format a URL into another type (e.g. format an absolute URL into a scheme-relative one): `format`.

### `determineUrlType`

Takes a string or a URL object and returns one of the following strings:

- ABSOLUTE: a complete URL, with (at least) protocol and host.
  Examples: `http://example.com` or `http://example.com/path`
- SCHEME_RELATIVE: A URL with no protocol, but with a host.
  Examples: `//example.com` or `//example.com/path`
- PATH_ABSOLUTE: A URL with no protocol or host, but with a path starting at the root.
  Examples: `/` or `/path`
- PATH_RELATIVE: A URL with no protocol or host, but with a path relative to the current resource.
  Examples: `../foo` or `bar`
- INVALID Any invalid URL.
  Example: `///`

### `getUrlParts`

Returns an object with the URL's parts, taking into account that some of them may be missing,
depending on the type of URL.

```js
getUrlParts( 'https://user:password@www.example.com:8000/path?param=value#anchor' );
```

The above returns:

```js
const object = {
	protocol: 'https:',
	host: 'www.example.com:8000',
	hostname: 'www.example.com',
	port: '8000',
	origin: 'https://www.example.com:8000',
	pathname: '/path',
	hash: '#anchor',
	search: '?param=value',
	searchParams: searchParams, // A URLSearchParams object containing the search parameters
	username: 'user',
	password: 'password',
};
```

**IMPORTANT NOTE**: URL part names are different between Node's `url` and `lib/url`. This is because
`lib/url` is aligned to the `URL` / `URLSearchParam` standard in detriment of the legacy API.

### `getUrlFromParts`

Returns a URL object (not a string) from an absolute URL's parts. Note that this method will only
work for parts adding up to a full absolute URL, and will throw an error for anything else.

If you need to obtain a string from this method, just access the `href` property on the returned
URL object.

```js
getUrlFromParts( parts );
```

### `format`

Formats a URL object or string into a particular type. For example, you can format an absolute URL
as a scheme-relative URL:

```js
format( 'http://example.com/path', 'SCHEME_RELATIVE' );
// -> '//example.com/path'
```

Formatting to a wider type (for example, from scheme-relative to absolute) will produce an error, as
there is missing information.

Attempting to format to `PATH_RELATIVE` or `INVALID` will also fail with an error.
