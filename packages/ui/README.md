# Components

A library of React components that adhere to the Automattic Design System, to be used across Automattic products.

## Installation

```bash
yarn add @automattic/ui @wordpress/components
```

## Required stylesheets

You will need to load a minimum of two stylesheets for the components to appear correctly: one for `@automattic/ui` and one for `@wordpress/components`. How to load the WordPress stylesheet depends on your project.

```js
// Styles for `@automattic/ui` (Does not require separate RTL styles)
import "@automattic/ui/index.css";
```

### WordPress Component Styles

In a WordPress project, the stylesheet is available globaly, so add the `wp-components` stylesheet as a dependency of your plugin's stylesheet. See [wp_enqueue_style documentation](https://developer.wordpress.org/reference/functions/wp_enqueue_style/#parameters) for how to specify dependencies.

In a non-WordPress project, import the `build-style/style.css` file directly, located at `node_modules/@wordpress/components/build-style/style.css`. For RTL layouts, use the pre-built `style-rtl.css` file, or build your own with `rtlcss`.

```js
// Styles for `@wordpress/components` in a non-WordPress project
// (Requires separate RTL styles)
import "@wordpress/components/build-style/style.css";
```

## Development Workflow

This package is developed as part of the Calypso monorepo. Run `yarn`
in the root of the repository to get the required `devDependencies`.

### Tests

`yarn run test-packages`

`yarn run test-packages:watch`

### Using [Storybook](https://storybook.js.org/)

To see stories within this package, run `yarn workspace @automattic/ui run storybook:start`.
