# photon.js
[![Build Status](https://travis-ci.org/Automattic/photon.js.svg?branch=master)](https://travis-ci.org/Automattic/photon.js)

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


## Terms of Service

 * Use of this service is for users of the Jetpack by WordPress.com plugin only,
   and may be used by sites hosted on WordPress.com, on Jetpack-connected
   WordPress sites, or sites who have gotten special permission from Automattic
   Inc. If you move to another platform, or disconnect Jetpack from your site,
   we can’t promise it will continue to work.

 * Abuse of the Jetpack by WordPress.com Terms of Service could result in
   suspension of your site from WordPress.com-connected services. By
   enabling Photon you agree to be responsible in what you publish; in
   particular be sure that you don’t use the service for prohibited items
   (things like spam, viruses, or hate content). WordPress.com reserves the
   right, in its sole discretion, to temporarily or permanently revoke your
   ability to use and access Photon, with or without notice.


## License

MIT – Copyright 2014 Automattic

[Node.js]: http://nodejs.org
[WordPress.com]: http://www.wordpress.com
[Photon]: http://developer.wordpress.com/docs/photon/
