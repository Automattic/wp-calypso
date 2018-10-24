# Gutenberg extensions

This folder holds extensions for Gutenberg editor. You can either import them directly from here or build them using Calypso SDK. See [SDK documentation](../../../docs/sdk.md).

Your extension should follow this structure:

```
.
└── blockname/
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

## Presets

You can combine multiple extensions to one build by adding them to a preset.

Presets follow the same structure as blocks, just under `presets` folder:

```
.
└── presets/
    └── presetname/
        ├── editor.js
        ├── editor.scss
        ├── view.js
        └── view.scss
```

## Block naming conventions

Blocks are registered by providing a `name` and `settings` like this:

```js
registerBlockType( 'prefix/name', { /* settings */ } );
```

Public blocks should use the `jetpack/` prefix, e.g. `jetpack/markdown`.

Private and internal blocks should use the `a8c/` prefix.

