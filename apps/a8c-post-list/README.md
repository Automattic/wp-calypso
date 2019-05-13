# A8C Post List

Block that renders Blog.

## File Architecture

```
/dist
  a8c-post-list.css
  a8c-post-list.deps.json
  a8c-post-list.js
  a8c-post-list.rtl.css
a8c-post-list.php
index.js
index.scss
```

## Build System

Note: these scripts must be run from the Calypso root.

- `npx lerna run dev --scope='@automattic/a8c-post-list'`<br>
Compiles the plugin and watches for changes.

- `npx lerna run build --scope='@automattic/a8c-post-list'`<br>
Compiles and minifies the plugin for production.

Both these scripts will also move all source and PHP files into `/dist` in their respective folder.

The entry point is:

- `/index.js`

The output is:

- `/dist`

## Local Development

Build (or `run dev`) and symlink the plugin into a local WordPress install.

E.g.

```
npx lerna run build --scope='@automattic/a8c-post-list'

ln -s ~/Dev/wp-calypso/apps/a8c-post-list/ ~/Dev/wordpress/wp-content/plugins/a8c-post-list-plugin
```
