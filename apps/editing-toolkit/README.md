# WordPress.com Editing Toolkit Plugin

This plugin includes many sub-features which add blocks and new functionality to the Gutenberg editor. The plugin provides a single codebase which can be installed on any platform which requires these features, such as the WordPress.com multisite or other standalone WordPress instances.

This code is developed in the calypso monorepo at <https://github.com/Automattic/wp-calypso/tree/trunk/apps/editing-toolkit>.

## Rename Info

This plugin has been renamed from Full Site Editing Plugin to WordPress.com Editing Toolkit Plugin.
The following changed to use "editing-toolkit" in place of "full-site-editing".

- Directories and filenames referencing "full site editing"
- Code referencing those filenames
- Documentation
- CI job names

The following items did not change:

- The plugin slug, which will remain `full-site-editing` due to rename limitations in WordPress.
- The root full-site-editing-plugin.php file (to preserve the plugin slug).
- The `full-site-editing` textdomain, also to reference the slug.
- The \A8C\FSE php namespace may not ever be fully converted, since it is referenced in many places outside of the plugin.

## File Architecture

- `package.json`: The package file for the editing toolkit monorepo app.
- `.wp-env.json`: Local environment configuration for the editing toolkit plugin.
- `bin/`: Scripts to assis with your local developmenet environment and testing.
- `editing-toolkit-plugin/`: The root of the editing toolkit plugin.
  - `full-site-editing-plugin.php`: All initialization code should go here.
  - `block-patterns/`: Additional block patterns for Gutenberg.
  - `common/`: General functionality which doesn't fit a specific feature and is always executed.
  - `dotcom-fse/`: (_deprecated_) An early experiment for a consistent site editing experience in Gutenberg. ([Superceeded by the site-editor work in Gutenberg](https://github.com/WordPress/gutenberg/tree/trunk/packages/edit-site)).
  - `e2e-test-helpers/`: Functions to assist with e2e tests in Puppeteer.
  - `event-countdown-block/`: A block which counts down to a specified date.
  - `global-styles/`: (_deprecated_) A plugin which adds a global font picker to the editor. (Superceeded by global style work in Gutenberg.)
  - `jetpack-timeline/`: A block which lets you create a timeline of events.
  - `newspack-blocks/`: Container for newspack blocks such as the carousel block and the blog post block.
  - `paragraph-block/`: Customize paragraph block on WP.com.
  - `posts-list-block/`: (_deprecated_) A simple block to show a list of posts on a page. (Superceeded by the blog-posts-block.)
  - `starter-page-templates/`: Allows you to select different page layouts made of blocks.
  - `wpcom-block-editor-nux/`: WordPress.com-specific NUX dialogue.
  - `tags-education/`: Additional tags education for Gutenberg

## Shared WordPress scripts

WordPress has a mechanism to share scripts. We already depend on many core provided scripts. This plugin also includes its own shared scripts.

The following scripts are made available by the plugin:

- `a8c-fse-common-data-stores`: Import this script to register data stores.

At the moment, scripts are only enqueued for their side effects, i.e. you cannot import anything from them. The imports serve to ensure the script
is enqueued by WordPress as a script dependency. To depend on a script, add an import:

```js
import 'a8c-fse-common-data-stores';
```

## Build System

_Note: `cd` to `apps/editing-toolkit` before running these commands_

- `yarn dev`<br>
  Compiles the plugins and watches for changes.

- `yarn build`<br>
  Compiles and minifies the plugins for production.

Both these scripts will also move all source and PHP files into `/dist` in their respective folders.

The entry point is:

- **Plugin**: `/editing-toolkit-plugin/{{plugin-directory}}/index.js`

The output is:

- **Plugin**: `/editing-toolkit-plugin/{{plugin-directory}}/dist`

### Building Individual _Plugins_

You can also build one of the plugins separately by appending the plugin slug onto the `build` portion of the command. eg:

```sh
# Builds the `posts-list-block` Plugin only
yarn build:posts-list-block`
```

## Local Development

### Docker

For a simple Docker experience, use wp-env.

```sh
# From wp-calypso root:
./apps/editing-toolkit/bin/setup-env.sh
```

That script will set up the correct dependencies and install wp-env. Note that this includes `gutenberg` and `themes` directories installed next to (i.e. outside) the root calypso directory. Once the dependencies are in the correct location, make sure that they are built, and you can use `wp-env` commands to control the environment:

```sh
# All commands should be run from apps/editing-toolkit,
# which is where the .wp-env.json config file is located.

wp-env start # Starts the environment on localhost:4013
wp-env stop
wp-env run cli wp ... # Runs a wp-cli command.
```

Once the environment running, you can use the dev script (shown above), and the environment will automatically see the updated build. It works by mounting the editing toolkit plugin as a Docker volume.

### Other

Build (or `dev`) and symlink the plugin into a local WordPress install.

E.g.

```sh
cd apps/editing-toolkit
yarn build

ln -s ~/Dev/wp-calypso/apps/editing-toolkit/editing-toolkit-plugin/ ~/Dev/wordpress/wp-content/plugins/editing-toolkit-plugin
```

## Testing

The Plugin contains a suite of unit / integration tests powered by `@wordpress/scripts`.

_Run these commands from the apps/editing-toolkit directory_

```shell
yarn test:js
```

If you wish to "watch" and run tests on file change then run:

```shell
// Note the additional `:watch` below
yarn test:js:watch
```

To run PHP units tests:

```shell
yarn run test:php
```

Making sure you add your test suite to `editing-toolkit-plugin/phpunit.xml.dist`

### Troubleshooting wp-env

- Make sure you're using `npx <command>` to favour the local tools over global installs. There's no harm in running `npx some-command-not-in-node_modules/.bin`
- If there's an error connecting to the docker deamon, check that `docker-machine ls` shows a running machine named 'default', and try `docker-machine start`
- If the default machine is already running (or the mysql connection is refused) you may need to re-run `eval $(docker-machine env)`
- If there are missing includes or defines from Gutenberg and/or themes, check that they're installed and up-to-date. By default, `wp-env` expects to find Gutenberg next to (outside) the top level `wp-calypso` directory, as per `./apps/editing-toolkit/bin/setup-env.sh`
- You can get a lot more information by calling `wp-env` with the `--debug=true` flag, e.g. `npx wp-env --debug=true run phpunit 'phpunit -c /var/www/html/wp-content/plugins/editing-toolkit-plugin/phpunit.xml.dist'`. In particular, this flag will show you where to find the docker-machine configuration file and show you where files from your local environment are being mounted into the container images. It will also show that the first `phpunit` in this example is indicating the command should be run within the `phpunit` service defined in the Docker Compose config.

### Updating Snapshots

Occasionally you will need to update Jest Snapshots. This is so common that there's a dedicated script for this:

```shell
yarn test:js:update-snapshots
```

### Writing Tests

The tests make use of the 3rd party [React Testing Library](https://testing-library.com/docs/react-testing-library/). This library promotes healthy testing practices by encouraging testing of the component _interface_ rather than its internal APIs (ie: implementation details).

When writing tests try to approach them **from the perspective of how a user would interact with your component**. Approaching tests in this fashion provides greater confidence that tests will capture true component behaviors and avoids the need for costly refactoring should the component's implementation need to change.

For more on this approach please see the [excellent introduction in the React Testing Library docs](https://testing-library.com/docs/react-testing-library/intro).
