# Photon.js

JavaScript library for the [WordPress.com][] [Photon][] image manipulation service.

## How to use

Install for Node.js via `npm`:

```bash
npm install photon
```

Use `require( 'photon' );` in your module to generate build Photon URLs:

```js
const photon = require( 'photon' );

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
