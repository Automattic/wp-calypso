# Client

This is the heart of Calypso, the client side application. It's pieced together with webpack from different components — both external and internal. ([List of technologies used.](../docs/guide/tech-behind-calypso.md)) It only requires an HTML shell with a body to work with.

## Main modules

These are some of the key modules of the application, kept in `client`'s root for clarity:

- `boot` - the booting file that sets up the application and requires the main sections.
- `config` - generated configuration settings.
- `layout` - handles the main React layout, including the masterbar. Notably, it sets #primary and #secondary used to render the different sections.
- `sections.js` - defines section groups, paths, and main modules. (Used by webpack to generate separate chunks.)

## Components

The `/components` folder holds all the internal React components used to build the Calypso UI across sections. Most of these are rendered in `/devdocs/design` for reference.

## State

The `/state` folder holds the structure of the application global state and data flows.

## Lib

The `/lib` folder holds internal modules and utilities that power Calypso.

## Core Sections

These represent the top section in the masterbar as well as other significant areas of the app. Within these all the controllers for the entire app are expressed. Most React app-components live within their specific section and not in `client/components`.

- `my-sites`: the site related admin functionality. Akin to wp-admin.
- `reader`: the home of all Reader sections.
- `me`: the sections under the `/me` route.
- `post-editor`: the editor.
- `signup`: the signup flows.
