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
registerBlockType( 'prefix/name', { /* settings */ } );
```

## Building

To build bundle in `apps/o2-blocks/dist`, run:

```bash
# Builds files and places them in `apps/o2-blocks/dist`
cd apps/o2-blocks
yarn build
```
