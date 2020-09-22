# Comment

`Comment` handler class.

## API

### Comment([comment-id], [post-id], site-id, WPCOM);

Create a new `Comment` instance giving `comment-id`, `post-id`, `site-id` and `WPCOM` instance.

```js
const comment = Comment( '<comment-id>', '<post-id>', '<site-id>', WPCOM );
```

### Comment#get([query], fn)

Return a single Comment

```js
wpcom
	.site( 'blog.wordpress.com' )
	.comment( 32 )
	.get( function ( err, data ) {
		// comment `data` object
	} );
```

### Comment#replies([query], fn)

Return recent comments for a post

```js
wpcom
	.site( 'blog.wordpress.com' )
	.post( 342 )
	.comment()
	.replies( function ( err, data ) {} );
```

### Comment#add(body, fn)

Create a comment on a post

```js
wpcom
	.site( 'blog.wordpress.com' )
	.post( 342 )
	.comment()
	.add( 'Nice blog post !!!', function ( err, data ) {} );
```

### Comment#update(body, fn)

Edit a comment

```js
wpcom
	.site( 'blog.wordpress.com' )
	.comment( 123 )
	.update( 'It is not a blog post !!!', function ( err, data ) {} );
```

### Comment#reply(body, fn)

Create a Comment as a reply to another Comment

```js
wpcom
	.site( 'blog.wordpress.com' )
	.comment( 123 )
	.reply( "Im sorry, I've edited the previous comment", function ( err, data ) {} );
```

### Comment#del(body, fn)

Delete a comment

```js
wpcom
	.site( 'blog.wordpress.com' )
	.comment( 123 )
	.del( function ( err, data ) {} );
```
