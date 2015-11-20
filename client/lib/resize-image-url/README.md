# Resize Image URL

A simple utility to modify the sizing params on a "safe" URL (something that has been passed through `safe-image-url`)
without changing the path or host.

## Example
```js
var image = safeImageUrl( post.featured_image),
  imageThumb = resizeImageUrl( safeImageUrl, { resize: '40,40' } );
```

It takes the standard set of Photon parameters and removes any sizing params already present.
