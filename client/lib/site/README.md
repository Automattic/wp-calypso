Site
====

Instances of `site` are returned by [`sites-list`](/client/lib/sites-list) and represent a WordPress.com or Jetpack site. Properties on `site` mirror those of an individual site returned by the [`/me/sites`](https://developer.wordpress.com/docs/api/1.1/get/me/sites/) API endpoint.

#### jetpack.js
Extends `site` for Jetpack sites.

#### utils.js
Utility functions taking a `site` instance.
