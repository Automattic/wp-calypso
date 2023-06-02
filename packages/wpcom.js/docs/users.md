# Users

`Users` handler class.

## Example

Create a `Users` instance from WPCOM

```js
const wpcom = require( 'wpcom' )( '<your-token>' );
const suggestions = wpcom.users().suggest( '<site-id>' );
```

## API

### Users(id, WPCOM)

Create a new `Users` instance giving `WPCOM` instance.

```js
const users = Users( WPCOM );
```

### Users#suggest(query, fn)

Get @mention suggestions for the given site

```js
users.suggest( { site: 'mytestsite.wordpress.com', image_size: 32 }, function ( err, info ) {
	// `info` data object
} );
```
