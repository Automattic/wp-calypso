
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
wpconn.site.setId('blog.wordpress.com');
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

```js
var WPCONN = require('wp-connect');
var wpconn = new WPCONN();

wpconn.setToken('<token>');

wpconn.me(function(err, user){
  if (err) return console.log(err);
  // user object
});
```

### WPConn.site

## License

MIT – Copyright 2014 Automattic
