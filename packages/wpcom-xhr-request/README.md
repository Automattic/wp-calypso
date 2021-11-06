# wpcom-xhr-request

**REST-API and WP-API requests via XMLHttpRequest (and CORS)**

You likely want to use the high-level APIs in [`wpcom.js`][wpcom.js]
instead of using this module directly.

Works in both the browser and Node.js via [`superagent`][superagent].

### Installation

Install `wpcom-xhr-request` using `npm`:

```bash
$ npm install wpcom-xhr-request
```

### Example

```html
<html>
	<body>
		<script src="wpcom-xhr-request.js"></script>
		<script>
			WPCOM.xhr( '/me', function ( err, data ) {
				if ( err ) throw err;

				var div = document.createElement( 'div' );
				div.innerHTML = 'Your WordPress.com "username" is: <b>@' + data.username + '<\/b>';
				document.body.appendChild( div );
			} );
		</script>
	</body>
</html>
```

## API

### wpcomXhrRequest( [params], fn )

`Params`: optional parameters

- `method`: `GET` as default.
- `apiNamespace`: `WP-API` namepsace.
- `apiVersion`: `REST-API` app version - `1` as default.
- `proxyOrigin`: `https://public-api.wordpress.com` as default.
- `authToken`: token authentication.
- `query`: object used to pass the `query` to the request.
- `body`: object used to pass the `body` to the request.
- `form-data`: `POST` FormData (for `multipart/form-data`, usually a file upload).
- `processResponseInEnvelopeMode`: default `TRUE`.

`fn`: request callback function

This function has three parameters:

- `error`: defined if the request fails
- `body`: the object body of the response
- `headers`: the headers of the response

```js
import handler from 'wpcom-xhr-request';

// get .com blog data usign `REST-API`
handler( '/sites/en.blog.wordpress.com', ( error, body, headers ) => {
	if ( error ) {
		return console.error( 'Request failed: ', error );
	}

	console.log( 'WordPress blog: ', body );
} );

// get .com blog data using `WP-API`
handler(
	{
		path: '/sites/en.blog.wordpress.com',
		apiNamespace: 'wp/v2',
	},
	( error, body, headers ) => {
		if ( error ) {
			return console.error( 'Request failed: ', error );
		}

		console.log( 'WordPress blog: ', body );
	}
);

// get .org blog data (`WP-API`)
handler(
	{
		proxyOrigin: 'http://myblog.org/wp-json',
		path: '/',
		apiNamespace: 'wp/v2',
	},
	( error, body, headers ) => {
		if ( error ) {
			return console.error( 'Request failed: ', error );
		}

		console.log( 'WordPress blog: ', body );
	}
);
```

### Authentication

For API requests that require authentication to WordPress.com, you must pass in an
OAuth token as the `authToken` parameter in the `params` object for the API call.

You can get an OAuth token server-side through
[`node-wpcom-oauth`][node-wpcom-oauth], or any other OAuth2 interaction
mechanism.

### License

MIT – Copyright Automattic 2014

[wpcom.js]: https://www.npmjs.com/package/wpcom
[superagent]: https://visionmedia.github.io/superagent/
[node-wpcom-oauth]: https://github.com/Automattic/node-wpcom-oauth
