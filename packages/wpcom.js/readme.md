
# Wordpress connect module

  Layer to get resources from WordPress using the REST API

## API

### WPCONN();

Create a new instance of WPCONN

```js
var WPCONN = require('wp-connect');
var wpconn = new WPCONN();
```

### WPCONN#me();

```js
var WPCONN = require('wp-connect');
var wpconn = new WPCONN();

// set access token
wpconn.token('<your token>');

// get the user info
wpconn.me(function(err, user){
  // user info related with the given access token
});
```

### WPCONN#site.id(<id>);

Set site identifier

### WPCONN#site.info(params, fn);

Get the site information

```js
var WPCONN = require('wp-connect');
var wpconn = new WPCONN();

// set access token
wpconn.token('<your token here>');

// get site info
wpconn.site.id('blog.wordpress.com');
wpconn.site.info(function(err, site){
  // site data object
});
```

### WPCONN#site.posts(params, fn);

Get the site information

```js
wpconn.site.id('blog.wordpress.com');
wpconn.site.posts({ number: 10 }, function(err, posts){
  // posts array
});
```

### WPCONN.site.post.get(id, fn);

Get post site data

```js
// get post info
wpconn.site.post.get(435, function(err, post){
  // post data object
});
```

### WPCONN.site.post.add(data, fn);

Add a new post

```js
// get post info
var data = {
  "title": "A new post",
  "content": "<div>The content of the new post</div>"
};

wpconn.site.post.add(data, function(err, new_post){
  // object data of the new post already added
});
```

## Test

```cli
make
```

## License

MIT – Copyright 2014 Automattic
