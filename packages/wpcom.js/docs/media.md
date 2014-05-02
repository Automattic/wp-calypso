
# Media

`Media` handler class.

### Create a `Media` instance from Site

```js
var wpcom = require('wpcom')('<your-token>');
var media = wpcom.site('<site-id>').media('<media-id>');
});
```

## API

### Media(id, site, WPCOM)

Create a new `Media` instance giving `id`, `site-id` and `WPCOM` instance.

```js
var media = Media('<id>', '<site-id>', WPCOM);
```

### Media.id(id)

Set media `id`

### Media#get([query, ]fn)

Request a single media item

```js
media.get(function(err, data){
  // media data object
});
```

### Media#addFile(data, fn)

### Media#delete(fn) - Media#delete(fn)
