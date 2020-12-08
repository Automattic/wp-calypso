# CommentLike

`CommentLike` handler class.

## API

### CommentLike( comment-id, site-id, WPCOM )

Create a new `CommentLike` instance.

```js
const commentLike = CommentLike( '<comment-id>', '<site-id>', WPCOM );
```

### CommentLike#state(fn)

`CommentLike#mine` alias.

### CommentLike#mine(fn)

Get your like status for a comment

```js
wpcom
	.site( 'blog.wordpress.com' )
	.comment( 342 )
	.like()
	.mine( function ( err, data ) {
		// use CommentLike `data` object
	} );
```

### CommentLike#add(fn)

Like a comment

```js
wpcom
	.site( 'blog.wordpress.com' )
	.comment( 342 )
	.like()
	.add( function ( err, data ) {
		// I like this 342 comment
	} );
```

### CommentLike#del(fn)

Remove your existing like from a comment

```js
wpcom
	.site( 'blog.wordpress.com' )
	.comment( 342 )
	.like()
	.del( function ( err, data ) {
		// I don't like this 342 comment any more
	} );
```
