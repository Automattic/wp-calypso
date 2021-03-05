# Follow

`Follow` handler class.

## API

### Follow(site-id, WPCOM);

Createa a new `Follow` instance giving `site-id` and `WPCOM` instance.

```js
const follower = Follow( '<site-id>', WPCOM );
```

### Follow#follow(query, fn)

`Follow#add` alias

### Follow#add(query, fn)

Follow the current blog

```js
wpcom
	.site( 'blog.wordpress.com' )
	.follow()
	.add( function ( err, data ) {
		// response handler
	} );
```

### Follow#unfollow(query, fn)

`Follow#del` alias

### Follow#del(query, fn)

Unfollow the current blog

```js
wpcom
	.site( 'blog.wordpress.com' )
	.follow()
	.del( function ( err, data ) {
		// respnose handler
	} );
```

### Follow#state(query, fn)

`Follow#mine` alias.

### Follow#mine(query, fn)

Get your Follow status for a Site

```js
wpcom
	.site( 'blog.wordpress.com' )
	.follow()
	.mine( function ( error, data ) {
		// mine status
	} );
```
