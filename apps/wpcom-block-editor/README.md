# WP.com block editor

This package provides utilities for the WordPress.com block editor integration.

These utilities are intended to be built and then served from `widgets.wp.com`, so they can be loaded by a WordPress.com or a Jetpack connected site.

## Editors

There are two editors supported:

- **WP Admin block editor**. The block editor loaded by the WP Admin interface on `https://<SITE_SLUG>/wp-admin/post-new.php`.
- **Calypso block editor**. This is the block editor loaded by Calypso on `https://wordpress.com/block-editor/post/<SITE_SLUG>`. It is actually the WP Admin block editor embed on an iframe. We also refer to this implementation as _Gutenframe_.

## Features

The block editor integration provides features for the following combination of sites and editors:

<table>
  <tr>
    <th>Feature</th>
    <th>Editor</th>
    <th>Simple site</th>
    <th>Atomic site</th>
    <th>Jetpack site</th>
  </tr>
  <tr>
    <td rowspan="2">
      <a href="./src/default/features/rich-text.js"><code>rich-text</code></a>:
      Extensions for the Rich Text toolbar with the Calypso buttons missing on Core (i.e. underline, justify).
    </td>
    <td>WP Admin</td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td>Calypso</td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td rowspan="2">
      <a href="./src/default/features/switch-to-classic.js"><code>switch-to-classic</code></a>:
      Appends a button to the "More tools" menu for switching to the classic editor.
    </td>
    <td>WP Admin</td>
    <td>✅</td>
    <td>❌</td>
    <td>❌</td>
  </tr>
  <tr>
    <td>Calypso</td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td rowspan="2">
      <a href="./src/wpcom/features/fix-block-invalidation-errors.js"><code>fix-block-invalidation-errors</code></a>:
      Performs block attempt block recovery on editor load if validation errors are detected.
    </td>
    <td>WP Admin</td>
    <td>✅</td>
    <td>✅</td>
    <td>❌</td>
  </tr>
  <tr>
    <td>Calypso</td>
    <td>✅</td>
    <td>✅</td>
    <td>❌</td>
  </tr>
  <tr>
    <td rowspan="2">
      <a href="./src/wpcom/features/reorder-block-categories.js"><code>reorder-block-categories</code></a>:
      Moves Jetpack and CoBlocks Block Categories below Core Categories.
    </td>
    <td>WP Admin</td>
    <td>✅</td>
    <td>✅</td>
    <td>❌</td>
  </tr>
  <tr>
    <td>Calypso</td>
    <td>✅</td>
    <td>✅</td>
    <td>❌</td>
  </tr>
  <tr>
    <td rowspan="2">
      <a href="./src/wpcom/features/tracking.js"><code>tracking</code></a>:
      Adds analytics around specific user actions.
    </td>
    <td>WP Admin</td>
    <td>✅</td>
    <td>✅</td>
    <td>❌</td>
  </tr>
  <tr>
    <td>Calypso</td>
    <td>✅</td>
    <td>✅</td>
    <td>❌</td>
  </tr>
  <tr>
    <td rowspan="2">
      <a href="./src/calypso/features/iframe-bridge-server.js"><code>iframe-bridge-server</code></a>:
      Server-side handlers of the different communication channels we establish with the client-side when Calypso loads the iframed block editor. See <a href="../../client/gutenberg/editor/calypsoify-iframe.tsx"><code>calypsoify-iframe.jsx</code></a>.
    </td>
    <td>WP Admin</td>
    <td>❌</td>
    <td>❌</td>
    <td>❌</td>
  </tr>
  <tr>
    <td>Calypso</td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
  <tr>
    <td rowspan="2">
      <a href="./src/calypso/features/tinymce.js"><code>tinymce</code></a>:
      Tiny MCE plugin that overrides the core media modal used on classic blocks with the Calypso media modal.
    </td>
    <td>WP Admin</td>
    <td>❌</td>
    <td>❌</td>
    <td>❌</td>
  </tr>
  <tr>
    <td>Calypso</td>
    <td>✅</td>
    <td>✅</td>
    <td>✅</td>
  </tr>
</table>

## Structure

Features in the `wpcom-block-editor/src` folder loosely follow this structure:

```
.
└── bundle-name/
	├── features    ← Directory with all features that are bundled under this group.
	├── editor.js   ← script importing features that will be loaded only in the editor.
	├── editor.scss ← stylesheet importing styles of features that will be loaded only in the editor.
	├── view.js     ← script importing features that will be loaded in both editor and front-end.
	└── view.scss   ← stylesheet importing styles of features that will loaded in both editor and front-end.
```

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
