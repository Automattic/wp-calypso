# wpcom-proxy-request

**Proxied cookie-authenticated REST-API and WP-API requests to WordPress.com**

You likely want to use the high-level APIs in [`wpcom.js`][wpcom.js]
instead of using this module directly.

This module offers access to the WordPress.com REST-API and WP-API via a proxying `<iframe>`
pointing to a special URL that proxies API requests on the host page's behalf.

It is intended to be used in the browser (client-side) via a bundler like
browserify or webpack.

## Installation

Install `wpcom-proxy-request` using `npm`:

```sh
npm install wpcom-proxy-request
```

## Example

```js
// Import wpcom-proxy-request handler
import proxy from 'wpcom-proxy-request';

proxy( { path: '/me' }, function ( err, body, headers ) {
	if ( err ) {
		throw err;
	}

	const div = document.createElement( 'div' );
	div.innerHTML = 'Your WordPress.com "username" is: <b>@' + res.username + '</b>';
	document.body.appendChild( div );
} );
```

## Streaming with `emulateStreamBody`

For endpoints that return progressive responses (NDJSON or SSE via the proxy
iframe's HTTP 207 mechanism), set `emulateStreamBody: true` to receive a
`ReadableStream` instead of the final parsed body.

The promise resolves immediately with an object containing `ok`, `status`, and
`body` (a `ReadableStream<Uint8Array>`). Each chunk is an SSE-formatted line
(`data: {json}\n\n`), making it compatible with standard SSE parsers.

```js
import proxy from 'wpcom-proxy-request';

const response = await proxy( {
	path: '/wpcom/v2/some/streaming-endpoint',
	method: 'POST',
	body: { prompt: 'Hello' },
	emulateStreamBody: true,
} );

const reader = response.body.getReader();
const decoder = new TextDecoder();

while ( true ) {
	const { done, value } = await reader.read();
	if ( done ) { break };
	console.log( decoder.decode( value ) );
}
```

> **Note:** `emulateStreamBody` only works in promise mode (without a
> callback). When a callback is provided, the flag is ignored.

## Running tests

Compile and `watch` client-test application

```sh
make watch-test-app
```

Run server

```sh
make run-test-app
```

Open a tab pointing to `http://calypso.localhost:3001/`

## License

MIT – Copyright Automattic 2014

[wpcom.js]: https://github.com/Automattic/wpcom.js
