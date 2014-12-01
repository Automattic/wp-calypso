# wpcom.js

Official JavaScript library for the [WordPress.com][] [REST API][].
Compatible with Node.js and web browsers.

## How to use

### Node.js

Introduce the `wpcom` dependency in your `package.json`, and
then initialize it with your API Token.

```js
var wpcom = require('wpcom')('<your-token>');
var blog = wpcom.site('your-blog.wordpress.com');
blog.posts({ number: 8 }, function(err, list){});
```

### Browser

Include `dist/wpcom.js` in a `<script>` tag:

```html
<script src="wpcom.js"></script>
<script>
  var wpcom = WPCOM('<your-token>');
  var blog = wpcom.site('your-blog.wordpress.com');
  blog.posts({ number: 8 }, function(err, list){});
</script>
```

## API

* [WPCOM](./docs/wpcom.md)
* [Me](./docs/me.md)
* [Site](./docs/site.md)
* [Post](./docs/post.md)
* [Media](./docs/media.md)
* [Users](./docs/users.md)

## Examples

[Examples](./examples/Readme.md) doc page

## Test

Create `data.json` file into `test/` folder to can run the tests. You can copy
or rename the `test/data_example.json` file and then

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
