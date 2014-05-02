
# Site

`Site` handler class.

### Create a `Site` instance from WPCOM

```js
var wpcom = require('wpcom')('<your-token>');
var post = wpcom.site('<site-id>').post('<post-id>');
});
```

## API

### Site(id, WPCOM)

Create a new `Site` instance giving `id` and `WPCOM` instance.

```js
var site = Site('<id>', WPCOM);
```

### Site#get([query, ]fn)

Get site information

```js
site.get(function(err, info){
  // `info` data object
});
```

### Site#postsList([query, ]fn)

Get site posts list

```js
site.postsList(function(err, list){
  // `list` data object
});
```

### Site#mediaList([query, ]fn)

Get site media list

```js
site.mediaList(function(err, list){
  // `list` data object
});
```

## Site - Post

### Site#post(id)

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

### Site#media(id)

Create a new `Media` instance.

```js
var media = site.media('<media-id>');
```

### Site#addMediaFile(data, fn)

Add a new media to site. Return a `Media` instance.

```js
var new_media = site.addMedia({ urls: [] }, function(err, list){
});
```
