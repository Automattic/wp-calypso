# photon.js

JavaScript library for the [WordPress.com][] [Photon][] image manipulation
service.


## How to use

### Node.js

Install for Node.js via `npm`:

``` bash
$ npm install photon
```

Now you can simply `require('photon')` in your module to generate Photon URLs.

```js
var photon = require('photon');

var url = photon('https://cloudup.com/logo/cloudup-salmon-logo.png')

console.log(url);
// https://i2.wp.com/cloudup.com/logo/cloudup-salmon-logo.png
```

### Browser

Include `dist/photon.js` in a `<script>` tag. A `photon` global
variable function is exposed:

```html
<script src="photon.js"></script>
<script>
  var url = photon('https://cloudup.com/logo/cloudup-salmon-logo.png')

  console.log(url);
  // https://i2.wp.com/cloudup.com/logo/cloudup-salmon-logo.png
</script>
```

You can also consume photon.js via browserify when installed via `npm` (see
Node.js instructions above).


## License

MIT – Copyright 2014 Automattic

[Node.js]: http://nodejs.org
[WordPress.com]: http://www.wordpress.com
[Photon]: http://developer.wordpress.com/docs/photon/
