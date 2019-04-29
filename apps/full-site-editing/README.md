# Full Site Editing

This app contains both the `full-site-editing-plugin` and the required `blank-theme`.

## File Architecture

```
/blank-theme
  /dist
    blank-theme.css
    blank-theme.deps.json
    blank-theme.js
    blank-theme.rtl.css
  functions.php
  index.js
  index.php
  index.scss

/full-site-editing-plugin
  /dist
    full-site-editing-plugin.css
    full-site-editing-plugin.deps.json
    full-site-editing-plugin.js
    full-site-editing-plugin.rtl.css
  full-site-editing-plugin.php
  index.js
  index.scss
```

## Build System

Note: these scripts must be run from the Calypso root.

- `npx lerna run dev --scope='@automattic/full-site-editing'`<br>
Compiles both the theme and the plugin, and watches for changes.

- `npx lerna run build --scope='@automattic/full-site-editing'`<br>
Compiles and minifies for production both the theme and the plugin.

Both these scripts will also move all source and PHP files into `/dist` in their respective folder.

The entry points are:

- `/blank-theme/index.js`
- `/full-site-editing-plugin/index.js`

The outputs are:

- `/blank-theme/dist`
- `/full-site-editing-plugin/dist`

## Local Development

Build (or `run dev`) and symlink both the theme and the plugin into a local WordPress install.

E.g.

```
npx lerna run build --scope='@automattic/full-site-editing'

ln -s ~/Dev/wp-calypso/apps/full-site-editing/full-site-editing-plugin/ ~/Dev/wordpress/wp-content/plugins/full-site-editing-plugin

ln -s ~/Dev/wp-calypso/apps/full-site-editing/blank-theme/ ~/Dev/wordpress/wp-content/themes/blank-theme
```
