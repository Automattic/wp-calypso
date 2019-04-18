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

Note: these scripts must be run from the Calypso root.

- `npx lerna run dev --scope='@automattic/full-site-editing'`<br>
Compiles both the theme and the plugin, and watches for changes.

- `npx lerna run build --scope='@automattic/full-site-editing'`<br>
Compiles and minifies for production both the theme and the plugin.

The entry points are:

- `/blank-theme/index.js`
- `/full-site-editing-plugin/index.js`

The outputs are:

- `/blank-theme/dist/blank-theme.(js|css)`
- `/full-site-editing-plugin/dist/full-site-editing-plugin.(js|css)`
