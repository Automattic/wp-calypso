# wpcom.js

  [WordPress.com][] JavaScript API client designed for Node.JS and
  browsers.

## How to use

### Node.JS

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

## Examples

[Examples](./examples/Readme.md) doc page

## Test

Create `data.json` file into `test/` folder to can run the tests. You can copy
or rename the `test/data_example.json` file.

```json
{
  "token": {
    "global": "<global token>"
  },

  "site": {
    "public": {
      "url": "<public blog url>"
    },
    "private" : {
      "url": "<private blog url>",
      "id": "<private blog id>",
      "private": "<token>"
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
$ make test-all
```

You use `make test` and pass a first argument to filter tests in the test rule

```bash
$make test site.addPost()
```

**Note**: Don't add `http://` in `public_site` and `private_site` values.


## License

MIT – Copyright 2014 Automattic

[Node.js]: http://nodejs.org
[REST API]: http://developer.wordpress.com/docs/api
[WordPress.com]: http://www.wordpress.com
[node-wpcom-oauth]: https://github.com/Automattic/node-wpcom-oauth
