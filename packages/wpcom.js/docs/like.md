# Like

`Like` handler class.

## API

### Like(post-id, site-id, WPCOM);

Create a new `Like` instance giving `post-id`, `site-id` and `WPCOM` instance.

```js
const like = Like( '<post-id>', '<site-id>', WPCOM );
```

### Like#state(fn)

`Like#mine` alias.

### Like#mine(fn)

Get your Like status for a Post

```js
wpcom
	.site( 'blog.wordpress.com' )
	.post( 342 )
	.like()
	.mine( function ( err, data ) {
		// like `data` object
	} );
```

### Like#add(fn)

Like the post

```js
wpcom
	.site( 'blog.wordpress.com' )
	.post( 342 )
	.like()
	.add( function ( err, data ) {
		// I like this 342 post
	} );
```

### Like#del(fn)

Remove your existing Like from the post

```js
wpcom
	.site( 'blog.wordpress.com' )
	.post( 342 )
	.like()
	.del( function ( err, data ) {
		// I don't like this 342 post any more
	} );
```
