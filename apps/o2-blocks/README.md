# Gutenberg extensions for o2 theme

Your extension should follow this structure:

```
.
└── src/blockname/
    ├── editor.js    ← script loaded only in the editor
    ├── editor.scss  ← styles loaded only in the editor
    ├── view.js      ← script loaded in the editor and theme
    └── view.scss    ← styles loaded in the editor and theme
```

If your block depends on another block, place them all in extensions folder:

```
.
├── blockname/
└── sub-blockname/
```

## Block naming conventions

Blocks are registered by providing a `name` and `settings` like this:

```js
registerBlockType( 'prefix/name', {
	/* settings */
} );
```

## Building

To build bundle in `apps/o2-blocks/dist`, run:

```bash
# Builds files and places them in `apps/o2-blocks/dist`
cd apps/o2-blocks
yarn build
```

## Development environment

1. Run commands from this app directory: `cd apps/o2-blocks`
1. Build `o2-blocks` by running `yarn build --watch`
1. Run `yarn wp-env start` to start a local dockerized WordPress instance that will automatically use and activate `o2-blocks` as a plugin.

If you are not well-acquainted with `wp-env` yet, read [this](https://make.wordpress.org/core/2020/03/03/wp-env-simple-local-environments-for-wordpress/) article first.
