
# Me

`Me` handler class.

### Create a `Me` instance from WPCOM

```js
var wpcom = require('wpcom')('<your-token>');
var me = wpcom.me();
});
```

## API

### Me(WPCOM)

Create a new `Me` giving a `WPCOM` instance.

```js
var me = Me(WPCOM);
```

### Me#get([query, ]fn)

Get meta data about auth token's User

```js
me.get(function(err, info){
  // `me` info object
});
```

### Me#sites([query, ]fn)

Get a list of the current user's sites

```js
me.sites(function(err, list){
  // posts list object
});
```

### Me#likes([query, ]fn)

Get a list the currently authorized user's likes

```js
me.likes(function(err, data){
  // likes data object
});
```

### Me#groups([query, ]fn)

Get a list of the current user's group

```js
me.groups(function(err, list){
  // groups list object
});
```

### Me#connections([query, ]fn)

Get a list of the current user's connections to third-party services

```js
me.connections(function(err, list){
  // connections list object
});
```
