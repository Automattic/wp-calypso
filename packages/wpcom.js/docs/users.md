
# Users

`Users` handler class.

### Create a `Users` instance from WPCOM

```js
var wpcom = require('wpcom')('<your-token>');
var suggestions = wpcom.users().suggest('<site-id>');
});
```

## API

### Users(id, WPCOM)

Create a new `Users` instance giving `WPCOM` instance.

```js
var users = Users(WPCOM);
```

### Users#suggest(query, fn)

Get @mention suggestions for the given site

```js
users.suggest({ site: 'mytestsite.wordpress.com', image_size: 32 }, function(err, info){
  // `info` data object
});
```