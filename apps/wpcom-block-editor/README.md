# WP.com block editor

This package provides utilities for the WordPress.com block editor integration.

These utilities are intended to be built and then served from `widgets.wp.com`, so they can be loaded by a WordPress.com or a Jetpack connected site.

## Environments

There are two environments the block editor integration supports:

- **WP Admin block editor**. The block editor loaded by the WP Admin interface on `https://<SITE_SLUG>/wp-admin/post-new.php`.
- **Calypso block editor**. This is the block editor loaded by Calypso on `https://wordpress.com/block-editor/post/<SITE_SLUG>`. It is actually the WP Admin block editor embed on an iframe. We also refer to this implementation as _Gutenframe_.
 
## File architecture

- `/common`: Logic than runs on both environments (WP Admin and Calypso).
- `/calypso`: Logic than runs only on the Calypso iframed block editor.  

### Common utilities

- `disable-nux-tour.js`: Disable the pop-up tooltip tour that is displayed on first use.
- `rich-text.js`: Extensions for the Rich Text toolbar with the Calypso buttons missing on Core (i.e. underline, justify).
- `fix-block-invalidation-errors.js`: (Atomic/Simple) Performs block attempt block recovery on editor load if validation errors are detected.
- `switch-to-classic.js`: Append a button to the "More tools" menu for switching to the classic editor.
- `tracking`: Adds analytics around specific user actions for Simple, Jetpack and Atomic sites.
- `reorder-block-categories`: (Atomic/Simple) Moves Jetpack and CoBlocks Block Categories below Core Categories
- `unregister-experimental-blocks`: Removes some experimental blocks from the Gutenberg Plugin.

### Calypso utilities

- `iframe-bridge-server.js`: Server-side handlers of the different communication channels we establish with the client-side when Calypso loads the iframed block editor. See [`calypsoify-iframe.jsx`](https://github.com/Automattic/wp-calypso/blob/master/client/gutenberg/editor/calypsoify-iframe.jsx).
- `tinymce.js`: Tiny MCE plugin that overrides the core media modal used on classic blocks with the Calypso media modal.

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
