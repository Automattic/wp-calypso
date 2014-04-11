# node-wpcom

### WordPress API for nodejs

  Nodejs module to get resources from [WordPress](http://www.wordpress.com) using the [developer.wordpress.com/docs/api/](REST API).

## How to use it

```js
var wpcom = require('wpcom')('<your-token>');

// get the user info
wpcom.me.info(function(err, user){
  // Meta data about auth token's User
});

// set site
wpcom.site.id('blog.wordpress.com');

// get site information
wpcom.site.info(function(err, site){
  // `site` information object
});

// get site posts
wpcom.site.posts(function(err, posts){
  // site `posts` object
});

// add a new post
wpcom.site.post.add({ title: 'The new post title !!!' }, function(err, post){
  // new `post` object
});
```

## API

### WPCOM('&lt;token&gt;');

Create a new instance of WPCOM. `token` parameter is optional but it's needed to
make admin actions or to access to protected resources.

Note: If you wanna a way to get the access token
then can use [node-wpcom-oauth](https://github.com/Automattic/node-wpcom-oauth) npm module.

### WPCOM#me

* **#me.info(params, fn)** Meta data about auth token's User
* **#me.sites(params, fn)** A list of the current user's sites
* **#me.likes(params, fn)** List the currently authorized user's likes
* **#me.groups(params, fn)** A list of the current user's group
* **#me.connections(params, fn)** A list of the current user's connections to third-party services

### WPCOM#site

* **#site.id(site_id)** Set site id
* **#site.info(params, fn)** Information about site.id
* **#site.posts(params, fn)** Matching posts

### WPCOM#site.post

* **#site.post.get(id, params, fn)** Return a single Post (by id)
* **#site.post.getBySlug(slug, params, fn)** Return a single Post (by id)
* **#site.post.add(data, fn)** Create a post
* **#site.post.edit(id, data, fn)** Edit a post
* **#site.post.del(id, fn)** Delete a post

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

... and then

```cli
$ make
```

**note**: for `public_site` and `private_site` don't add http:// to urls.

## License

MIT – Copyright 2014 Automattic
