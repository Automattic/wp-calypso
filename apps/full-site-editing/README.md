# Full Site Editing

This app contains:

* `full-site-editing-plugin` - this is a master Plugin containing:
  - `posts-list-block` Plugin
  - `starter-page-templates` Plugin
* the `blank-theme` required for the `full-site-editing` plugin

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
  class-a8c-rest-template-controller.php
  class-full-site-editing.php
  index.js
  index.scss

/posts-list-block
  /blocks
    /posts-list
      block.json
      index.js
      style.scss
  /dist
    a8c-posts-list.css
    a8c-posts-list.deps.json
    a8c-posts-list.js
    a8c-posts-list.rtl.css
  /templates
    no-posts.php
    post-item.php
    posts-list.php
  class-posts-list-block.php
  index.js
  utils.php
```

## Build System

Note: these scripts must be run from the Calypso _root_ directory.

- `npx lerna run dev --scope='@automattic/full-site-editing'`<br>
Compiles both the theme and the plugins, and watches for changes.

- `npx lerna run build --scope='@automattic/full-site-editing'`<br>
Compiles and minifies for production both the theme and the plugins.

Both these scripts will also move all source and PHP files into `/dist` in their respective folders.

The entry points are:

- `/blank-theme/index.js`
- `/full-site-editing-plugin/{{plugin-directory}}/index.js`

The outputs are:

- `/blank-theme/dist`
- `/full-site-editing-plugin/{{plugin-directory}}/dist`

You can also build one of the Plugins individually by appending the plugin slug onto the `build` comment. eg: 

```
// Builds the `posts-list-block` Plugin only
npx lerna run build:posts-list-block --scope='@automattic/full-site-editing'`
```

## Local Development

Build (or `run dev`) and symlink both the theme and the plugin into a local WordPress install.

E.g.

```
npx lerna run build --scope='@automattic/full-site-editing'

ln -s ~/Dev/wp-calypso/apps/full-site-editing/full-site-editing-plugin/ ~/Dev/wordpress/wp-content/plugins/full-site-editing-plugin

ln -s ~/Dev/wp-calypso/apps/full-site-editing/blank-theme/ ~/Dev/wordpress/wp-content/themes/blank-theme
```
