# Full Site Editing

This app contains both the `full-site-editing-plugin` and the required `blank-theme`.

## File Architecture

These is an example of what we should find inside the theme and plugin folders:

```
/blank-theme
  /dist
    blank-theme.css
    blank-theme.js
  functions.php
  index.js
  index.php
  index.scss

/full-site-editing-plugin
  /dist
    full-site-editing-plugin.css
    full-site-editing-plugin.js
  full-site-editing-plugin.php
  index.js
  index.scss
```

## Local Development

Symlink both the theme and the plugin into a local WordPress install.

E.g.

```
ln -s ~/Dev/wp-calypso/apps/full-site-editing/full-site-editing-plugin/ ~/Dev/wordpress/wp-content/plugins/full-site-editing-plugin

ln -s ~/Dev/wp-calypso/apps/full-site-editing/blank-theme/ ~/Dev/wordpress/wp-content/themes/blank-theme
```

## Build System

There are 4 scripts that perform roughly the same tasks, but on different folders and environments:

```
npm run dev:plugin
npm run dev:theme
```
Compile from the `index.js` entry point, put the unminified output into `/dist`, and watch for changes.

```
npm run build:plugin
npm run build:theme
```
Compile from the `index.js` entry point, and put the minified output into `/dist`.
