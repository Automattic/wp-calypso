# Components

A library of React components that adhere to the Automattic Design System, to be used across Automattic products.

## Installation

```bash
yarn add @automattic/ui
```

## WordPress Component Styles

Some components require CSS styles from `@wordpress/components`, which you will need to load once in your app in order for them to appear correctly.

In a WordPress project, add the `wp-components` stylesheet as a dependency of your plugin's stylesheet. See [wp_enqueue_style documentation](https://developer.wordpress.org/reference/functions/wp_enqueue_style/#parameters) for how to specify dependencies.

In non-WordPress projects, import the `build-style/style.css` file directly, located at `node_modules/@wordpress/components/build-style/style.css` (`style-rtl.css` for RTL layouts).

## Development Workflow

This package is developed as part of the Calypso monorepo. Run `yarn`
in the root of the repository to get the required `devDependencies`.

### Tests

`yarn run test-packages`

`yarn run test-packages:watch`

### Using [Storybook](https://storybook.js.org/)

To see stories within this package, run `yarn workspace @automattic/ui run storybook:start`.
