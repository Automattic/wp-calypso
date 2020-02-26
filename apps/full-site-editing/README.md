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

## Testing

The Plugin contains a suite of unit / integration tests powered by `@wordpress/scripts`.

We use `lerna` to run the tests using the following basic command:

```shell
npx lerna run test:js --scope='@automattic/full-site-editing' --stream
```

If you wish to "watch" and run tests on file change then run:

```shell
// Note the additional `:watch` below
npx lerna run test:js:watch --scope='@automattic/full-site-editing' --stream
```

### Updating Snapshots

Occasionally you will need to update Jest Snapshots. This is so common that there's a dedicated script for this:

```shell
npx lerna run test:js:update-snapshots --scope='@automattic/full-site-editing' --stream
```

### Writing Tests

The tests make use of the 3rd party [React Testing Library](https://testing-library.com/docs/react-testing-library/). This library helps to promote healthy testing practices by encouraging testing of the component _interface_ rather than its internal APIs (ie: implementation details).

When writing tests try to approach them **from the perspective of how a user would interact with your component**. Approaching tests in this fashion provides greater confidence that tests will capture true component behaviors and avoids the need for costly refactoring should the component's implementation need to change.

For more on this approach please see the [excellent introduction in the React Testing Library docs](https://testing-library.com/docs/react-testing-library/intro).