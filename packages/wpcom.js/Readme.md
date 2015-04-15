# wpcom.js

Official JavaScript library for the [WordPress.com][] [REST API][].
Compatible with Node.js and web browsers.

## How to use

### Node.js

Introduce the `wpcom` dependency into your `package.json`, and then initialize
it with your API token ([optional](#authentication)).

```js
// Edit a post on a site
var wpcom = require('wpcom')('<your-token>');
var blog = wpcom.site('your-blog.wordpress.com');
blog.posts({ number: 8 }, function(err, list) { ... });
```

### Browser

Include `dist/wpcom.js` in a `<script>` tag:

```html
<script src="wpcom.js"></script>
<script>
  var wpcom = WPCOM('<your-token>');
  var blog = wpcom.site('your-blog.wordpress.com');
  blog.posts({ number: 8 }, function(err, list) { ... });
</script>
```

### Authentication

Not all requests require a REST API token.  For example, listing posts on a
public site is something anyone can do.

If you do need a token, here are some links that will help you generate one:
- [OAuth2 Authentication](https://developer.wordpress.com/docs/oauth2/)
  at WordPress.com Developer Resources
- [`wpcom-oauth-cors`](https://github.com/Automattic/wpcom-oauth-cors):
  a client-side WordPress.com OAuth2 library using CORS
- [`wpcom-oauth`](https://github.com/Automattic/node-wpcom-oauth):
  a server-side (Node.js) WordPress.com OAuth2 library
- If you just want to quickly create a token, the
  [example app bundled with `wpcom-oauth`](https://github.com/Automattic/node-wpcom-oauth/tree/master/example)
  is probably the easiest way.

## API

* [WPCOM](./docs/wpcom.md)
* [WPCOM#Req](./docs/wpcom.req.md) - Direct requests to WordPress REST-API
* [Me](./docs/me.md)
* [Site](./docs/site.md)
* [Post](./docs/post.md)
* [Media](./docs/media.md)
* [Users](./docs/users.md)

## Examples

```js
// Edit a post on a site
var wpcom = require('wpcom')('<your-token>');
var blog = wpcom.site('your-blog.wordpress.com');
blog.post({ slug: 'a-post-slug' }).update(data, function(err, res) { ... });
```

You can omit the API token for operations that don't require permissions:

```js
// List the last 8 posts on a site
var wpcom = require('wpcom')();
var blog = wpcom.site('your-blog.wordpress.com');
blog.posts({ number: 8 }, function(err, list) { ... });
```

More pre-made examples are in the [`examples/`](./examples/) directory.

## Test

Create `fixture.json` file in the `test/` folder to can run the tests. You can copy
or rename the `test/fixture_example.json`.  Be sure to update the <site-id> and <global-token> at the top of the file.

To then run tests:

```bash
$ make test-all
```

You use `make test` and pass a first argument to filter tests in the test rule

```bash
$ make test site.addPost
```

## License

MIT – Copyright 2014 Automattic

[Node.js]: http://nodejs.org
[REST API]: http://developer.wordpress.com/docs/api
[WordPress.com]: http://www.wordpress.com
[node-wpcom-oauth]: https://github.com/Automattic/node-wpcom-oauth
