# WP.com block editor

This package provides utilities for the WordPress.com block editor integration.

These utilities are intended to be built and then served from `widgets.wp.com`, so they can be loaded by a WordPress.com or a Jetpack connected site.

## Editors

There are two editors supported:

- **WP Admin block editor**. The block editor loaded by the WP Admin interface on `https://<SITE_SLUG>/wp-admin/post-new.php`.
- **Calypso block editor**. This is the block editor loaded by Calypso on `https://wordpress.com/block-editor/post/<SITE_SLUG>`. It is actually the WP Admin block editor embed on an iframe. We also refer to this implementation as _Gutenframe_.

## Features

Skip down to **structure** if you'd like to know how this relates to the code and directory structure!

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
        <a href="./src/wpcom/features/deprecate-coblocks-buttons.js"><code>deprecate-coblocks-buttons</code></a>:
        Prevents the CoBlocks Buttons block from being insertable.
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

Features in the `wpcom-block-editor/src` folder follow this structure. This roughly corresponds to three main bundles which are created by webpack, and allows us to support (or not support) various features according to the grid above.

```
.
└── src/
	├── default ← Always loaded.
	├── calypso ← Only loaded when you access Gutenberg through the iFrame.
	├── wpcom   ← Only loaded when you access Gutenberg on Simple and Atomic sites.
```

You can access Gutenberg through the iFrame or directly through wp-admin on any Simple, Atomic, and connected Jetpack site. (Note that Atomic sites are a subset of connected Jetpack sites.) The best way to explain the structure is with an example.

Say you have an Atomic site. You visit the block-editor through the iFrame. In this scenario, the [Jetpack plugin code here](https://github.com/Automattic/jetpack/blob/13c47f276b5b5f30e2347c6486d7fd158bc3a025/modules/wpcom-block-editor/class-jetpack-wpcom-block-editor.php#L282-L335) determines which bundles to load. It will load the **default** bundle because that is always loaded. **calypso** is loaded because it knows we are in an iFrame. It also loads the **wpcom** directory because it knows this is an Atomic site. As a result, all features are supported in this situation.

If we access Gutenberg on the same Atomic site through wp-admin, the same PHP code will run. However, this time it can tell that we are not in the iFrame, so it does _not_ load the **calypso** directory, but still loads default and wpcom.

Say you have a connected Jetpack site that is non-Atomic. In this scenario, if you access Gutenberg through the iFrame, the PHP code will detect the iFrame, so it loads **calypso**, and it also loads the **default** directory by default. 

Then, each bundle contains features for different types of pages. For example, the `editor.js` file is in every directory, since the main goal of this app is to provide features for the editor. Additionally, the `view.js` file exists in the `default` directory in order to provide some code which is always loaded on the front end.

```
.
└── $bundle_name/
	├── features    ← Directory with all features that are bundled under this group.
	├── editor.js   ← script importing features that will be loaded only in the editor.
	├── editor.scss ← stylesheet importing styles of features that will be loaded only in the editor.
	├── view.js     ← script importing features that will be loaded in both editor and front-end.
	└── view.scss   ← stylesheet importing styles of features that will loaded in both editor and front-end.
```


## Build

### Manual

To manually build the package, execute the command below passing the directory where the distributable files will be generated:

```sh
cd apps/wpcom-block-editor

# Watch for changes:
yarn build --watch

# Production build:
yarn build

# Change output directory (default is ./dist)
yarn build --output-path=/path-to-folder
```

### Automatic

The `build-wpcom-block-editor` CircleCI job automatically generates a build on every Calypso PR.

<img alt="CircleCI job" width="700" src="https://cldup.com/hpfqhRKU0i-1200x1200.png" />

The build files are stored as artifacts of the job.

<img alt="Artifacts" width="700" src="https://cldup.com/W1yGG6MCsM-1200x1200.png" />

_You must be logged in to CircleCI for the Artifacts tab to be displayed._
