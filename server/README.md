Server-side Rendering
=====================

Output is built on the server side by the following `modules` (corresponding to subdirectories of `server/`):

* `boot` is the entry point, which loads the [Express](http://expressjs.com/) middleware and configures some basic settings. It then invokes
* `pages`, which uses Express to
  * set up even more configuration, depending the type of the environment (`development`, `staging`, `production`, etc.), settings from `/config`, etc.
  * define the basic routing, depending on whether the user is logged in or not
  * compute necessary variables, wraps them in a `context` object
  * render content by passing that to `404.jsx`, `500.jsx`, `browsehappy.jsx`, `support-user.jsx`, `index.jsx` or `desktop.jsx` template files, respectively.
* `index.jsx`
  * builds an HTML skeleton, including `<script>` tags to load relevant JavaScript files (minified unless in debug mode or in the `development` environment) that contain client-side (React) rendering code
  * lastly, it runs `window.AppBoot()`, which is defined in  `client/boot`.
