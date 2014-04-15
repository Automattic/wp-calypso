# node-wpcom

### WordPress API for nodejs

  Nodejs module to get resources from [WordPress](http://www.wordpress.com) using the [developer.wordpress.com/docs/api/](REST API).

## Installation

```
$ npm install node-wpcom
```

## How to use it

```js
// create a WPCOM instance
var wpcom = require('wpcom')('<your-token>');

// create a blog hanlder instance
var blog = wpcom.sites('blog.wordpress.com');

// get blog posts
blog.posts({ number: 8 }, function(err, list){
  // posts list object
});
```

## API

### WPCOM('token');

Create a new instance of WPCOM. `token` parameter is optional but it's needed to
make admin actions or to access to protected resources.

Note: If you wanna a way to get the access token can use [node-wpcom-oauth](https://github.com/Automattic/node-wpcom-oauth) npm module.

### WPCOM#me()

Create a `Me` object. More info in [Me doc page](./doc/me.md).

```js
var wpcom = require('wpcom')('<your-token>');
var me = wpcom.me();

// get user information
me.get(function(err, info){
});
```

### WPCOM#sites('site-id')

Create a `Sites` object. More info in [Sites doc page](./doc/sites.md).

```js
var wpcom = require('wpcom')('<your-token>');
var site = wpcom.sites();

// get blog posts
site.posts(function(err, list){
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

Finally open a browser and load the page pointing to http://localhost:3000

## Test

Create `data.json` file into `test/` folder to can run the tests. You can copy
or rename the `test/data_example.json` file.

```json

{
  "token": {
    "global": "<global token>",
    "private": "<private token>"
  },

  "site": {
    "public": {
      "url": "<public blog url>"
    },
    "private" : {
      "url": "<private blog url>",
      "id": "<private blog id>"
    }
  },

  "new_post_data": {
    "title": "New testing post",
    "content": "<div style=\"color: red;\">The content of the new testing post</div>"
  }
}

```

... and then

```cli
$ make
```

**note**: don't add `http://` in`public_site` and `private_site` values.

## License

MIT – Copyright 2014 Automattic
