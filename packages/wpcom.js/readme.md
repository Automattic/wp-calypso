# wpcom.js

### [WordPress.com][] API for [Node.js][]

  [Node.js][] module to get resources from [WordPress.com][] using
  the [REST API][].


## Installation

```bash
$ npm install wpcom
```


## How to use it

```js
// create a WPCOM instance
var wpcom = require('wpcom')('<your-token>');

// create a blog handler instance
var blog = wpcom.sites('blog.wordpress.com');

// get blog posts
blog.posts({ number: 8 }, function(err, list){
  // posts list object
});
```


## API

### new WPCOM('token');

Create a new instance of WPCOM. `token` parameter is optional but it's needed to
make admin actions or to access to protected resources.

**Note**: You can use the [node-wpcom-oauth][] module to get an _access token_.

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

```bash
$ npm install
```

... and then run the application

```bash
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

```bash
$ make
```

**Note**: don't add `http://` in`public_site` and `private_site` values.


## License

MIT – Copyright 2014 Automattic

[Node.js]: http://nodejs.org
[REST API]: http://developer.wordpress.com/docs/api
[WordPress.com]: http://www.wordpress.com
[node-wpcom-oauth]: https://github.com/Automattic/node-wpcom-oauth
