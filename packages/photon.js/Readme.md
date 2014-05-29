# photon.js

JavaScript library for the [WordPress.com][] [Photon][] image manipulation
service.


## How to use

### Node.js

_Not yet published on npm…_

Simply `require('photon')` in your module to generate Photon URLs.

```js
var photon = require('photon');

var url = photon('http://wordpress.com/wp-content/mu-plugins/atlas/images/w.png');

console.log(url);
// "https://i0.wp.com/wordpress.com/wp-content/mu-plugins/atlas/images/w.png"
```

### Browser

Include `dist/photon.js` in a `<script>` tag. A `photon` global
variable function is exposed:

```html
<script src="photon.js"></script>
<script>
  var url = photon('http://wordpress.com/wp-content/mu-plugins/atlas/images/w.png');

  console.log(url);
  // "https://i0.wp.com/wordpress.com/wp-content/mu-plugins/atlas/images/w.png"
</script>
```


## License

MIT – Copyright 2014 Automattic

[Node.js]: http://nodejs.org
[WordPress.com]: http://www.wordpress.com
[Photon]: http://developer.wordpress.com/docs/photon/
