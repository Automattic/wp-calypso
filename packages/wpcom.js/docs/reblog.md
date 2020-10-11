# Reblog

`Reblog` handler class.

## API

### Reblog(post-id, site-id, WPCOM);

Create a new `Reblog` instance giving `post-id`, `site-id` and `WPCOM` instance.

```js
const reblog = Reblog( '<post-id>', '<site-id>', WPCOM );
```

### Reblog#state([query], fn)

`Reblog#mine` alias.

### Reblog#mine([query], fn)

Get your reblog status for the Post

```js
wpcom
	.site( 'blog.wordpress.com' )
	.post( 342 )
	.reblog()
	.mine( function ( err, data ) {
		// reblog `data` object
	} );
```

### Reblog#add(body, fn)

Reblog the post

```js
const body = {
	destination_site_id: 456,
	note: 'Really nice a blog post !',
};

wpcom
	.site( 'blog.wordpress.com' )
	.post( 342 )
	.reblog()
	.add( body, function ( err, data ) {
		// I've reblogged this 342 post
	} );
```

### Reblog#to(destination_site_id, [note], fn)

It's almost a `Reblog#mine` alias.

```js
wpcom
	.site( 'blog.wordpress.com' )
	.post( 342 )
	.reblog()
	.to( 456, 'Really nice a blog post !', function ( err, data ) {
		// I've reblogged this 342 post
	} );
```
