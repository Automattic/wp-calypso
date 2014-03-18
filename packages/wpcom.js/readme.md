
# Wordpress connect module

  Layer to get resources from WordPress using the REST API

```js
var WPCONN = require('wp-connect');
var wpconn = new WPCONN();

// set access token
wpconn.setToken('<your token>');

// get the user info
wpconn.me(function(err, user){
  // user info related with the given access token
});

// get site info
var site = wpconn.site();
site.get(function(err, site){
  // site object data
});
```

## How to use

### Create the wp connect object and require resource

```js
var WPCONN = require('wp-connect');
var wpconn = new WPCONN();
```

## API

### WPConn#me()

Request the user profile


### WPConn#site(opts)

Create a new `Blog` instance.

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
