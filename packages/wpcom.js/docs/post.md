
# Post

`Post` handler class.

### Create a `Post` instance from Blog

```js
var wpcom = require('wpcom')('<your-token>');
var blog = wpcom.sites('blog.wordpress.com');
var post = blog.post(342);
});
```

## API

### Post(id, site, WPCOM);

Create a new `Post` instance giving `id`, `site-id` and `WPCOM` instance.

```js
var post = Post('<id>', '<site-id>', WPCOM);
```

### Post(data, site, WPCOM);

Create a new `Post` instance giving `data` object, `site-id` and `WPCOM` instance.


```js
var data = { id: '<id>', slug: '<slug>' };
var post = Post(data, '<site-id>', WPCOM);
```

### Post.id(id)

Set post `id`

### Post.slug(slug)

Set post `slug`.

### Post#get([params], fn)

Get post data by `id` or `slug` depending on which of these parameter is
defined, giving priority to `id` over `slug`

```js
post.get(params, function(err, data){
  // post data object
});
```

### Post#getbyslug(fn)

Get post data by `slug`. `slug` must have been previously defined throught of
constructor or using .slug() method.

```js
var post = Post({ slug: '<slug>' }, '<site-id>', WPCOM);
post.getbyslug(params, function(err, data){
  // post data object
});
```

### Post#add(data, fn);

### Post#update(data, fn);

### Post#delete(fn);

### Post#likes(fn);
