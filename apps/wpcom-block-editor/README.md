# WP.com block editor

This package provides utilities for the WordPress.com block editor integration.

These utilities are intended to be built and then served from `widgets.wp.com`, so they can be loaded by a WordPress.com or a Jetpack connected site.

## Editors

There are two editors supported:

- **WP Admin block editor**. The block editor loaded by the WP Admin interface on `https://<SITE_SLUG>/wp-admin/post-new.php`.
- **Calypso block editor**. This is the block editor loaded by Calypso on `https://wordpress.com/block-editor/post/<SITE_SLUG>`. It is actually the WP Admin block editor embed on an iframe. We also refer to this implementation as _Gutenframe_.

## Features

The block editor integration provides features for the following type of sites and editors:

<table>
  <tr>
    <th>Site</th>
    <th>Editor</th>
    <th><a href="./src/default"><code>default</code></a></th>
    <th><a href="./src/wpcom"><code>wpcom</code></a></th>
    <th><a href="./src/calypso"><code>calypso</code></a></th>
  </tr>
  <tr>
    <td rowspan="2">WordPress.com</td>
    <td>WP Admin</td>
    <td>✅</td>
    <td>✅</td>
    <td>❌</td>
  </tr>
  <tr>
    <td>Calypso</td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td rowspan="2">Jetpack</td>
    <td>WP Admin</td>
    <td>✅</td>
    <td>❌</td>
    <td>❌</td>
  </tr>
  <tr>
    <td>Calypso</td>
    <td>✅</td>
    <td>❌</td>
    <td>✅</td>
  </tr> 
</table>

### `default`

- [`rich-text`](./src/default/rich-text.js): Extensions for the Rich Text toolbar with the Calypso buttons missing on Core (i.e. underline, justify).
- [`switch-to-classic`](./src/default/switch-to-classic.js): Appends a button to the "More tools" menu for switching to the classic editor.

### `wpcom`

- [`disable-nux-tour`](./src/wpcom/disable-nux-tour.js): Disables the welcome guide that is displayed on first use.
- [`fix-block-invalidation-errors`](./src/wpcom/fix-block-invalidation-errors.js): Performs block attempt block recovery on editor load if validation errors are detected.`](./src/common/): (Atomic/Simple) Performs block attempt block recovery on editor load if validation errors are detected.
- [`reorder-block-categories`](./src/wpcom/reorder-block-categories.js): Moves Jetpack and CoBlocks Block Categories below Core Categories.
- [`tracking`](./src/wpcom/tracking.js): Adds analytics around specific user actions for Simple, Jetpack and Atomic sites.
- [`unregister-experimental-blocks`](./src/wpcom/unregister-experimental-blocks.js): Removes some experimental blocks from the Gutenberg Plugin.

### `calypso`

- [`iframe-bridge-server`](./src/calypso/iframe-bridge-server.js): Server-side handlers of the different communication channels we establish with the client-side when Calypso loads the iframed block editor. See [`calypsoify-iframe.jsx`](https://github.com/Automattic/wp-calypso/blob/master/client/gutenberg/editor/calypsoify-iframe.jsx).
- [`tinymce`](./src/calypso/tinymce.js): Tiny MCE plugin that overrides the core media modal used on classic blocks with the Calypso media modal.

## Build

### Manual

To manually build the package, execute the command below passing the directory where the distributable files will be generated:

```
npx lerna run build --scope='@automattic/wpcom-block-editor' -- -- --output-path=/path-to-folder
```

_Wonky double `--` is needed for first skipping Lerna args and then NPM args to reach Webpack._

### Automatic

The `build-wpcom-block-editor` CircleCI job automatically generates a build on every Calypso PR.

<img alt="CircleCI job" width="700" src="https://cldup.com/hpfqhRKU0i-1200x1200.png" />

The build files are stored as artifacts of the job.

<img alt="Artifacts" width="700" src="https://cldup.com/W1yGG6MCsM-1200x1200.png" />

_You must be logged in to CircleCI for the Artifacts tab to be displayed._
