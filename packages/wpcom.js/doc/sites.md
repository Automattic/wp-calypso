
# Sites

`Sites` handler class.

### Create a `Sites` instance from WPCOM

```js
var wpcom = require('wpcom')('<your-token>');
var site = wpcom.sites('<blog-id>');
});
```

## API

### Sites(id, WPCOM);

Create a new `Sites` instance giving `id` and `WPCOM` instance.

```js
var site = Sites('<id>', WPCOM);
```

### Sites#get([params], fn)

Get site information

```js
site.get(function(err, info){
  // `info` data object
});
```

### Sites#posts([params], fn)

Get site posts

```js
site.posts(function(err, list){
  // `list` data object
});
```

## Sites - Post

### Sites#post(id);

Create a new `Post` instance.

```js
var post = site.post('<post-id>');
```

### Sites#addPost(data, fn)

Add a new post to site. Return a `Post` instance.

```js
var new_post = site.addPost({ title: 'It is my new post' }, function(err, post){
});
```

### Sites#deletePost(id, fn)

Delete a blog post

```js
var del_post = site.deletePost('<post-id>', function(err, post){
});
```

## Sites - Media

### Sites#media(id);

Create a new `Media` instance.

```js
var media = site.media('<media-id>');
```

### Sites#addMedia(data, fn)

Add a new media to site. Return a `Media` instance.

```js
var new_media = site.addMedia({ urls: [] }, function(err, list){
});
```
