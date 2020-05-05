# Full Site Editing (FSE) Plugin

This plugin should not be confused with the site editor work in core Gutenberg. This plugin includes many sub-features which add blocks and ophew functionality to the Gutenberg editor. The plugin provides a single codebase which can be installed on any platform which requires these features, such as the WordPress.com multisite or other standalone WordPress instances. 

## File Architecture
* `package.json`: The package file for the FSE monorepo app.
* `.wp-env.json`: Local environment configuration for the FSE plugin.
* `bin/`: Scripts to assis with your local developmenet environment and testing.
* `full-site-editing-plugin/`: The root of the FSE plugin.
  - `full-site-editing-plugin.php`: All initialization code should go here.
  - `block-patterns/`: Additional block patterns for Gutenberg.
  - `blog-posts-block/`: A wrapper for the Newspack Homepage Articles block.
  - `common/`: General functionality which doesn't fit a specific feature and is always executed.
  - `dotcom-fse/`: (_deprecated_) An early experiment for a consistent site editing experience in Gutenberg. (Superceeded by the site-editor work in Gutenberg.)
  - `e2e-test-helpers/`: Functions to assist with e2e tests in Puppeteer.
  - `event-countdown-block/`: A block which counts down to a specified date.
  - `global-styles/`: (_deprecated_) A plugin which adds a global font picker to the editor. (Superceeded by global style work in Gutenberg.)
  - `jetpack-timeline/`: A block which lets you create a timeline of events.
  - `posts-list-block/`: (_deprecated_) A simple block to show a list of posts on a page. (Superceeded by the blog-posts-block.)
  - `site-editor/`: Gutenberg site-editor integration code for WordPress.com.
  - `starter-page-templates/`: Allows you to select different page layouts made of blocks.
  - `wpcom-block-editor-nux/`: WordPress.com-specific NUX dialogue.


## Build System

_Note: `cd` to `apps/full-site-editing` before running these commands_

- `yarn dev`<br>
Compiles the plugins and watches for changes.

- `yarn build`<br>
Compiles and minifies the plugins for production.

Both these scripts will also move all source and PHP files into `/dist` in their respective folders.

The entry point is:

- __Plugin__: `/full-site-editing-plugin/{{plugin-directory}}/index.js`

The output is:

- __Plugin__: `/full-site-editing-plugin/{{plugin-directory}}/dist`

### Building Individual _Plugins_

You can also build one of the Plugins separately by appending the plugin slug onto the `build` portion of the command. eg:

```sh
# Builds the `posts-list-block` Plugin only
yarn build:posts-list-block`
```

## Local Development

### Docker:
For a simple Docker experience, use wp-env.
```sh
# From wp-calypso root:
./apps/full-site-editing/bin/setup-env.sh
```

That script will set up the correct dependencies and install wp-env. Once the dependencies are in the correct location, make sure that they are built, and you can use `wp-env` commands to control the environment:

```sh
# All commands should be run from apps/full-site-editing,
# which is where the .wp-env.json config file is located.

wp-env start # Starts the environment on localhost:4013
wp-env stop
wp-env run cli wp ... # Runs a wp-cli command.
```

Once the environment running, you can use the dev script (shown above), and the environment will automatically see the updated build. It works by mounting the FSE plugin as a Docker volume.

### Other:
Build (or `dev`) and symlink the plugin into a local WordPress install.

E.g.

```sh
cd apps/full-site-editing
yarn build

ln -s ~/Dev/wp-calypso/apps/full-site-editing/full-site-editing-plugin/ ~/Dev/wordpress/wp-content/plugins/full-site-editing-plugin
```

## Testing

The Plugin contains a suite of unit / integration tests powered by `@wordpress/scripts`.

_Run these commands from the apps/full-site-editing directory_

```shell
yarn test:js
```

If you wish to "watch" and run tests on file change then run:

```shell
// Note the additional `:watch` below
yarn test:js:watch
```

### Updating Snapshots

Occasionally you will need to update Jest Snapshots. This is so common that there's a dedicated script for this:

```shell
yarn test:js:update-snapshots
```

### Writing Tests

The tests make use of the 3rd party [React Testing Library](https://testing-library.com/docs/react-testing-library/). This library helps to promote healthy testing practices by encouraging testing of the component _interface_ rather than its internal APIs (ie: implementation details).

When writing tests try to approach them **from the perspective of how a user would interact with your component**. Approaching tests in this fashion provides greater confidence that tests will capture true component behaviors and avoids the need for costly refactoring should the component's implementation need to change.

For more on this approach please see the [excellent introduction in the React Testing Library docs](https://testing-library.com/docs/react-testing-library/intro).