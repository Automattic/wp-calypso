# Verbum Block Editor

This lives in: [wp-calpyso/packages/verbum-block-editor](https://github.com/Automattic/wp-calypso/tree/trunk/packages/verbum-block-editor).

Verbum Block Editor is a lightweight Gutenberg editor, tailored specifically for enhancing the commenting experience. It offers a user-friendly interface, enabling effortless composition and formatting of comments.

## Features

- Automatically focuses on the last block when clicking on any empty white space.
- Initial focus is set to the first paragraph upon loading.
- Efficiently handles embeds by integrating all necessary API middlewares.
- Incorporates an iframed editor to minimize CSS collisions.

## Development

This package can be utilized in two primary ways:

### Directly In Calypso
- The package is directly integrated into Calypso as a standard package.
- No separate build process is required after modifications.
- Direct file alterations are reflected immediately in Calypso.

### Via widgets.wp.com
- The package publishes a bundle on widgets.wp.com for broader accessibility.
- Development process:
  1. Navigate to the package's directory: `cd package/verbum-block-editor`.
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
