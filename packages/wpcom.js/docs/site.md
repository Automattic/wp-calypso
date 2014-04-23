
# Site

`Site` handler class.

### Create a `Site` instance from WPCOM

```js
var wpcom = require('wpcom')('<your-token>');
var site = wpcom.site('<blog-id>');
});
```

## API

### Site(id, WPCOM);

Create a new `Site` instance giving `id` and `WPCOM` instance.

```js
var site = Site('<id>', WPCOM);
```

### Site#get([params], fn)

Get site information

```js
site.get(function(err, info){
  // `info` data object
});
```

### Site#posts([params], fn)

Get site posts

```js
site.posts(function(err, list){
  // `list` data object
});
```

## Site - Post

### Site#post(id);

Create a new `Post` instance.

```js
var post = site.post('<post-id>');
```

### Site#addPost(data, fn)

Add a new post to site. Return a `Post` instance.

```js
var new_post = site.addPost({ title: 'It is my new post' }, function(err, post){
});
```

### Site#deletePost(id, fn)

Delete a blog post

```js
var del_post = site.deletePost('<post-id>', function(err, post){
});
```

## Site - Media

### Site#media(id);

Create a new `Media` instance.

```js
var media = site.media('<media-id>');
```

### Site#addMedia(data, fn)

Add a new media to site. Return a `Media` instance.

```js
var new_media = site.addMedia({ urls: [] }, function(err, list){
});
```
