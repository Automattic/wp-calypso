# Resize Image URL

A simple utility to modify the sizing params on a URL without changing the path
or host.

## Usage

Pass a URL and either a numeric resize values (pixels width and optional
height), or an object of resizing parameters to the function. The return value
reflects the resized image URL. The function supports WordPress.com, Photon,
and Gravatar image URLs.

If passing numeric resize values, the function will automatically detect the
service hosting the URL (WordPress.com, Photon, Gravatar) and append the
appropriate query arguments. If the passed URL does not match one of these
services, it will first be processed using [`safeImageUrl`](../safe-image-url),
which will convert it to a Photon URL automatically before applying the resize
query arguments.

```js
resizeImageUrl( 'https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?w=1000', {
	resize: '500,500',
} );
// https://testonesite2014.files.wordpress.com/2014/11/image5.jpg?resize=500%2C500

resizeImageUrl( 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60', 200 );
// https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=200

resizeImageUrl( 'https://example.com/image.gif', 50, 20 );
// https://i0.wp.com/example.com/image.gif?fit=50%2C20
```

If passing an object of query arguments, reference the [Photon API documentation](https://developer.wordpress.com/docs/photon/api/)
for supported parameters to be passed.
