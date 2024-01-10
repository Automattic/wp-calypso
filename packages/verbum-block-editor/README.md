# Verbum Block Editor

Verbum Block Editor is a lightweight Gutenberg editor designed specifically for comments. It provides a simplified and intuitive interface for users to compose and format their comments effortlessly.

## Features

- Autofocus on the last block when the empty white space is clicked.
- Autofocus on the first paragraph on load.
- Handles embeds by adding all the needed API middlewares.
- Uses and iframed editor to limit CSS collisions.

## WIP
Soon, this will be published on NPM and used everywhere a user can edit comments (in Verbum and in Calypso's `/comments/all/` page).


## Development

This package is used in two ways:

### Directly In Calypso
The package is consumed like any other package and you don't have to build it or anything after you modify it. You can change the files and you'll see the changes in Calypso.

### Via widgets.wp.com
This package published a bundle on widgets.wp.com to be consumed anywhere it is needed. The process for this is pretty straight forward.

1. Move to the package's folder `cd package/verbum-block-editor`.
2. Run `yarn dev --sync`.
3. Your changes will be synced with your sandbox to `/home/wpcom/public_html/widgets.wp.com/verbum-block-editor`.

### Deploying changes

After you modify the package, please do the following to deploy.

1. Make sure your sandbox is in a clean git state.
2. Run `yarn build --sync`
3. Create a patch.
4. Deploy the patch. 

