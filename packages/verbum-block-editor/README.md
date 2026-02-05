# Verbum Block Editor

This lives in: [wp-calpyso/packages/verbum-block-editor](https://github.com/Automattic/wp-calypso/tree/trunk/packages/verbum-block-editor).

Verbum Block Editor is a lightweight Gutenberg editor, tailored specifically for enhancing the commenting experience. It offers a user-friendly interface, enabling effortless composition and formatting of comments.

## Features

- Automatically focuses on the last block when clicking on any empty white space.
- Initial focus is set to the first paragraph upon loading.
- Efficiently handles embeds by integrating all necessary API middlewares.
- Incorporates an iframed editor to minimize CSS collisions.

## Bundle Size Optimization

The Verbum Block Editor stubs out heavy dependencies that are pulled in transitively by the Gutenberg editor but aren't needed for the comment editing use case. This reduces the bundle size by ~50% (from 4.2 MiB to 2.1 MiB).

### Stubbed Modules

| Module                                                                               | Reason                                       | Size Savings |
| ------------------------------------------------------------------------------------ | -------------------------------------------- | ------------ |
| `@wordpress/sync`                                                                    | Collaborative editing (yjs/lib0/simple-peer) | ~500KB       |
| `@wordpress/date`, `date-fns`, `react-day-picker`                                    | Date/time pickers                            | ~2.5MB       |
| `@wordpress/commands`                                                                | Command palette                              | ~33KB        |
| `@wordpress/components` (navigation, focal-point-picker, color-picker, palette-edit) | Unused UI components                         | ~250KB       |
| `showdown`                                                                           | Markdown parser                              | ~156KB       |
| `react-easy-crop`                                                                    | Image cropping                               | ~46KB        |

### How It Works

The webpack config uses `NormalModuleReplacementPlugin` to replace these modules with a consolidated stub file (`src/stubs/index.js`) that exports no-op functions and null components.

### Adding New Stubs

1. Identify unused modules via bundle analysis (`yarn build --analyze`)
2. Add the module pattern to `modulesToStub` in `webpack.config.js`
3. Add any required exports to `src/stubs/index.js`
4. Test the comment editor to ensure no regressions

## Development

This package can be utilized in two primary ways:

### Directly In Calypso

- The package is directly integrated into Calypso as a standard package.
- No separate build process is required after modifications.
- Direct file alterations are reflected immediately in Calypso.

### Via widgets.wp.com

- The package publishes a bundle on widgets.wp.com for broader accessibility.
- Development process:
  1. Navigate to the package's directory: `cd packages/verbum-block-editor`.
  2. Execute `yarn dev --sync`.
  3. Changes are synchronized to `/home/wpcom/public_html/widgets.wp.com/verbum-block-editor` on your sandbox.
  4. **This this version, `wp.i18n` global is expected to be present**.

### Deploying Changes

To deploy modifications to the package:

1. Ensure your sandbox is in a clean git state.
2. Run `yarn upload`. This will upload the production-built files as well as the translations to your sandbox.
3. Create a patch.
4. Deploy the patch.

### Translations

This project uses .org's GlotPress translations as a source.

To translate simply run `yarn translate`.
