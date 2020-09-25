# Post

`Post` handler class.

## Example

Create a `Post` instance from Site

```js
const wpcom = require( 'wpcom' )( '<your-token>' );
const post = wpcom.site( 'blog.wordpress.com' ).post( 342 );
```

## API

### Post(id, site, WPCOM);

Create a new `Post` instance giving `id`, `site-id` and `WPCOM` instance.

```js
const post = Post( '<id>', '<site-id>', WPCOM );
```

### Post(data, site, WPCOM);

Create a new `Post` instance giving `data` object, `site-id` and `WPCOM` instance.

```js
const data = { id: '<id>', slug: '<slug>' };
const post = Post( data, '<site-id>', WPCOM );
```

### Post.id(id)

Set post `id`

### Post.slug(slug)

Set post `slug`.

### Post#get([query, ]fn)

Get post data by `id` or `slug` depending on which of these parameter is
defined, giving priority to `id` over `slug`

```js
post.get( function ( err, data ) {
	// post data object
} );
```

### Post#getBySlug(fn)

Get post data by `slug`. `slug` must have been previously defined through the
constructor or using the `.slug()` method.

```js
const post = Post( { slug: '<slug>' }, '<site-id>', WPCOM );
post.getBySlug( function ( err, data ) {
	// post data object
} );
```

### Post#add(data, fn)

### Post#update(data, fn)

### Post#del(fn) - Post#delete(fn)

Delete a Post. Note: If the post object is of type post or page and the trash
is enabled, this request will send the post to the trash. A second request will
permanently delete the post.

### Post#likesList(fn)

Get post likes list

```js
wpcom
	.site( 'blog.wordpress.com' )
	.post( 342 )
	.likesList( function ( err, list ) {
		// like `list` object
	} );
```

### Post#like()

Create and return a new `Like` instance.
More info in [Like doc page](./like.md).

```js
const like = wpcom.site( 'blog.wordpress.com' ).post( 342 ).like();
```

### Post#reblog()

Create and return a new `Reblog` instance.
More info in [Reblog doc page](./reblog.md).

```js
const reblog = wpcom.site( 'blog.wordpress.com' ).post( 342 ).reblog();
```

### Post#comment()

Create and return a new `Comment` instance.
More info in [Comment doc page](./comment.md).

### Post#comments()

Recent recent comments

```js
wpcom
	.site( 'blog.wordpress.com' )
	.post( 342 )
	.comments( function ( err, list ) {
		// post comments list
	} );
```
