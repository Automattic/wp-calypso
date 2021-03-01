# WPCOM

## WPCOM('token');

Create a new instance of WPCOM. `token` parameter is optional but it's needed to
make admin actions or to access to protected resources.

**Note**: You can use the [node-wpcom-oauth][] module to get an _access token_.

## WPCOM#me(fn)

Create a `Me` object. More info in [Me doc page](./me.md).

```js
const wpcom = require( 'wpcom' )( '<your-token>' );
const me = wpcom.me();
```

## WPCOM#site('site-id')

Create a `Site` object. More info in [Site doc page](./site.md).

```js
const wpcom = require( 'wpcom' )( '<your-token>' );
const site = wpcom.site();
```

## WPCOM#freshlyPressed([params, ]fn)

View Freshly Pressed posts from the WordPress.com homepage.

```js
wpcom.freshlyPressed( function ( err, data ) {
	if ( err ) throw err;
	console.log( '"Freshly Pressed" Posts:' );
	data.posts.forEach( function ( post ) {
		console.log( '  %s - %s', post.title, post.short_URL );
	} );
} );
```
