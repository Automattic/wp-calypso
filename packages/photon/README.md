# Photon.js

JavaScript library for the [WordPress.com][] [Photon][] image manipulation service.

## Requirements

Photon.js requires support for the standard URL and URLSearchParams APIs.
Be sure to use a polyfill if you're targetting environments without support for them. This includes old browsers, such
as Internet Explorer 11, and old versions of Node.js (5 or older).

## How to use

Install via `npm`:

```bash
yarn add photon
```

Import the `photon` method into your module.

For CommonJS:

```js
const photon = require( 'photon' );
```

For ES Modules:

```js
import photon from 'photon';
```

Then use the imported method to generate Photon URLs:

```js
const url = photon( 'https://wordpress.org/style/images/wporg-logo.svg' );

console.log( url );
// https://i1.wp.com/wordpress.org/style/images/wporg-logo.svg?ssl=1
```

## Terms of Service

* Use of this service is for users of the [Jetpack by WordPress.com](http://wordpress.org/extend/plugins/jetpack/) plugin only, and may be used by sites hosted on WordPress.com, or on Jetpack-connected WordPress sites. If you move to another platform, or disconnect Jetpack from your site, we can't promise it will continue to work.
* Abuse of the Jetpack by WordPress.com [Terms of Service](http://en.wordpress.com/tos/) could result in suspension of your site from WordPress.com-connected services. By enabling Photon you agree to be responsible in what you publish; in particular be sure that you don't use the service for prohibited items (things like spam, viruses, or hate content). WordPress.com reserves the right, in its sole discretion, to temporarily or permanently revoke your ability to use and access Photon, with or without notice.

## License

GPL-2.0-or-later – Copyright 2014-2019 Automattic

[Node.js]: http://nodejs.org
[WordPress.com]: http://www.wordpress.com
[Photon]: http://developer.wordpress.com/docs/photon/
