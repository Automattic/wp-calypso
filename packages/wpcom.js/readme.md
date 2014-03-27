# WP-Connect

### Wordpress connect module ###

  Layer to get resources from [WordPress](http://www.wordpress.com) using the [developer.wordpress.com/docs/api/](REST API).

## API

### WPCONN();

Create a new instance of WPCONN

```js
var WPCONN = require('wp-connect');
var wpconn = WPCONN();
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

## Example

Into `example/` folder download the npm dependencies:

```cli
$ npm install
```

... and then run the application

```cli
$ node index.js
```

## Test

Create `data.json` file into `test/` folder to can run the tests. You can copy
or rename the `test/data_example.json` file.

```json
{
  "client_id": "<your client_id here>",
  "client_secret": "<your client_secret here>",
  "token": "<your token app here>",

  "public_site": "<a public blog here>",

  "private_site": "<a private blog here>",
  "private_site_id": "<the ID of the private blog>",

  "new_post_data": {
    "title": "New testing post",
    "content": "<div style=\"color: red;\">The content of the new testing post</div>"
  }
}
```

Then ...

```cli
$ make
```

## License

MIT – Copyright 2014 Automattic
