# Full Site Editing

This app contains:

* `full-site-editing-plugin` - this is a master Plugin containing:
  - `blog-posts-block` Plugin
  - `dotcom-fse` Plugin
  - `posts-list-block` Plugin
  - `starter-page-templates` Plugin
  - `blog-posts-block` Plugin

## File Architecture

```
/full-site-editing-plugin
  /dist
    full-site-editing-plugin.css
    full-site-editing-plugin.asset.php
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
    a8c-posts-list.asset.php
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
Compiles the plugins and watches for changes.

- `npx lerna run build --scope='@automattic/full-site-editing'`<br>
Compiles and minifies the plugins for production.

Both these scripts will also move all source and PHP files into `/dist` in their respective folders.

The entry point is:

- __Plugin__: `/full-site-editing-plugin/{{plugin-directory}}/index.js`

The output is:

- __Plugin__: `/full-site-editing-plugin/{{plugin-directory}}/dist`

### Building Individual _Plugins_

You can also build one of the Plugins separately by appending the plugin slug onto the `build` portion of the command. eg: 

```
// Builds the `posts-list-block` Plugin only
npx lerna run build:posts-list-block --scope='@automattic/full-site-editing'`
```

## Local Development

Build (or `run dev`) and symlink the plugin into a local WordPress install.

E.g.

```
npx lerna run build --scope='@automattic/full-site-editing'

ln -s ~/Dev/wp-calypso/apps/full-site-editing/full-site-editing-plugin/ ~/Dev/wordpress/wp-content/plugins/full-site-editing-plugin
```

Note that if you are using Docker symlinks will not work. Instead you will need to mount the Plugin as a volume.
