<!-- @format -->

# Starter Block With React Component

This is a starter template for blocks built around a React component. Functionality is stripped down to nearly nothing. The block has an alignment control and a single sidebar text control.

# Component

`component.js` is the React component that is rendered in the editor and the view. All view logic goes here.

`config.js` contains all the basic information for the block, including title, keywords, and attributes. Any other constants should be defined here.

`edit.js` is the complete Gutenberg edit() function.

`editor.scss` is the stylesheet that will be used only in the editor. This typically contains almost no styles, since `view.scss` is also included in the editor environment.

`index.js` is just the Gutenberg initialization - registerBlockType(). This example includes `getEditWrapperProps` but its not required.

`save.js` is the complete Gutenberg save() function.

`style.scss` is the stylesheet that will be used in editor and view. Nearly all of the styles associated with the block belong here.

`view.js` is the script that renders the React component on the view side. This script should be usable with no changes for future blocks.

