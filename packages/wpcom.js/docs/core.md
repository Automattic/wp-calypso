
WPCOM#me()

Create a `Me` object. More info in [Me doc page](./docs/me.md).

```js
var wpcom = require('wpcom')('<your-token>');
var me = wpcom.me();

// get user information
me.get(function(err, info){
});
```

### WPCOM#site('site-id')

Create a `Site` object. More info in [Site doc page](./docs/site.md).

```js
var wpcom = require('wpcom')('<your-token>');
var site = wpcom.site();

// get blog posts
site.posts(function(err, list){
});
```

### WPCOM#freshlyPressed([query], fn)

View Freshly Pressed posts from the WordPress.com homepage.

```js
wpcom.freshlyPressed(function(err, data){
  if (err) throw err;
  console.log('"Freshly Pressed" Posts:');
  data.posts.forEach(function (post) {
    console.log('  %s - %s', post.title, post.short_URL);
  });
});
```
