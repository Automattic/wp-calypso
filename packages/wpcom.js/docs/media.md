# Media

`Media` handler class.

## Example

Create a `Media` instance from Site

```js
const wpcom = require( 'wpcom' )( '<your-token>' );
const media = wpcom.site( '<site-id>' ).media( '<media-id>' );
```

## API

### Media(id, site, WPCOM)

Create a new `Media` instance giving `id`, `site-id` and `WPCOM` instance.

```js
const media = Media( '<id>', '<site-id>', WPCOM );
```

### Media.id(id)

Set media `id`

### Media#get([query, ]fn)

Request a single media item

```js
media.get( function ( err, data ) {
	// media data object
} );
```

### Media#addFiles([query, ]files, fn)

```js
const media = Media( '<id>', '<site-id>', WPCOM );

// add a media file using a STRING
media.add( '/file/to/upload.png', function ( err, file ) {
	// file data object
} );

// add a media file using an OBJECT
media.add(
	{
		title: 'Nice picture',
		description: 'A nice pictures uploaded from a FILE',
		file: '/file/to/upload.png',
	},
	function ( err, file ) {
		// file data object
	}
);

// add many media files using an Array
media.add(
	[
		'file/01/to/upload.png',
		{
			title: 'Nice picture',
			description: 'A nice pictures uploaded from a FILE',
			file: '/file/02/to/upload.png',
		},
		'file/03/to/upload.png',
	],
	function ( err, file ) {
		// file data object
	}
);
```

### Media#addUrls([query, ]media, fn)

```js
const media = Media( '<id>', '<site-id>', WPCOM );

// add a media url using a String
media.add( 'http://file/to/upload.png', function ( err, file ) {
	// file data object
} );

// add a media url using an OBJECT
media.add(
	{
		title: 'Nice picture',
		description: 'A nice pictures uploaded from an URL',
		url: 'http://file/to/upload.png',
	},
	function ( err, file ) {
		// file data object
	}
);

// add many media url using an Array
media.add(
	[
		'http://file/01/to/upload.png',
		{
			title: 'Nice picture',
			description: 'A nice pictures uploaded from an URL',
			url: 'http://file/02/to/upload.png',
		},
		'http://file/03/to/upload.png',
	],
	function ( err, file ) {
		// file data object
	}
);
```

### Media#delete(fn) - Media#delete(fn)
