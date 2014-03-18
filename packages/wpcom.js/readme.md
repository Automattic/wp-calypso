
# Wordpress connect module

  Layer to get resources from WordPress using the REST API


## How to use

### Create the wp connect object

```js
var WPCONN = require('wp-connect');
var wpconn = new WPCONN();
```

## API

### WPConn#me()

Request the user profile

```js
var WPCONN = require('wp-connect');
var wpconn = new WPCONN();

wpconn.me(function(err, user){
  if (err) return console.log(err);
  // user object
});
```

### WPConn#blog(<token>)

Return a blog instance

```js
var WPCONN = require('wp-connect');
var wpconn = new WPCONN();

var blog = wpconn.blog(token);
```

## License

MIT – Copyright 2014 Automattic
