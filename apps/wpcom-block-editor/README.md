# @automattic/wpcom-block-editor

This package provides utilities for the WordPress.com block editor integration. 

These utilities are intended to be built and then served from `widgets.wp.com`, so they can be loaded by a WordPress.com or a Jetpack connected site.

## File architecture

### `iframe-bridge-server.js`

Server-side handlers of the different communication channels we establish with the client-side when Calypso loads the iframed block editor. See [`calypsoify-iframe.jsx`](https://github.com/Automattic/wp-calypso/blob/master/client/gutenberg/editor/calypsoify-iframe.jsx).

### `tinymce.js`

Tiny MCE plugin that overrides the core media modal used on classic blocks with the Calypso media modal.

### `utils.js`

Shared utilities to be used across the package.

## Build

### Manual

To manually build the package, execute the command below:

```
npx lerna run build --scope='@automattic/wpcom-block-editor'
```

This will generate the distributable files under the `dist` folder.

If you want to generate the build in a different folder, you can use the `bundle` script instead:

```
npx lerna run bundle --scope='@automattic/wpcom-block-editor' -- -- --output-path=/path-to-folder
```

_Wonky double `--` is needed for first skipping Lerna args and then NPM args to reach Webpack._

### Automatic

The `build-wpcom-block-editor` CircleCI job automatically generates a build on every Calypso PR.

<img alt="CircleCI job" width="700" src="https://cldup.com/hpfqhRKU0i-1200x1200.png" />

The build files are stored as artifacts of the job. 

<img alt="Artifacts" width="700" src="https://cldup.com/W1yGG6MCsM-1200x1200.png" />