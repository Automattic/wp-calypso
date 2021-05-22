# Promises

Until `wpcom.js` includes full support for promises,
there needs to be a way to offer that functionality
without disrupting existing code. This wrapper can be
used in new code until Promises are the native way of
returning from async code instead of callbacks.

> WARNING: If you extract a method from its parent class
> that method will lose its own `this` context and it will
> break. To ensure compliance, bind the method to its
> parent's context when sending it into the Promise

```js
let comment = wpcom.site( siteId ).comment( commentId );

// Fails
wpcom.Promise( comment.del ); // context stripped on method extraction

// Succeeds
wpcom.Promise( comment.del.bind( comment ) ); // bound context

// Also succeeds
comment = comment.del.bind( comment );
wpcom.Promise( comment );
```

## Examples

### Approving a comment

```js
const comment = wpcom.site( siteId ).comment( commentId );
wpcom
	.Promise( comment.update.bind( comment ), { status: 'approved' } )
	.then( ( response ) => updateComment( commentId, response ) )
	.catch( ( error ) => alert( error ) );
```

### Requesting the freshly-pressed list

```js
wpcom
	.Promise( wpcom.freshlyPressed.bind( wpcom ) )
	.timeout( 4000 ) // give up if longer than 4s
	.then( handleData )
	.catch( notifyNetworkError );
```

### Chaining promises

```js
const post = wpcom.site( siteId ).post( postId );
wpcom
	.Promise( post.get.bind( post ) )
	.then( wpcom.Promise( post.comments.bind( post ) ) )
	.then( renderComments );
```
