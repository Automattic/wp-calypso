# Components

A library of React components that adhere to the Automattic Design System, to be used across Automattic products.

## Installation

```bash
yarn add @automattic/ui
```

## Stylesheet

You will only need to load a single stylesheet for the `@automattic/ui` package (does not require separate RTL styles).

```js
import "@automattic/ui/style.css";
```

## Development Workflow

This package is developed as part of the Calypso monorepo. Run `yarn`
in the root of the repository to get the required `devDependencies`.

### Tests

`yarn run test-packages`

`yarn run test-packages:watch`

### Using [Storybook](https://storybook.js.org/)

To see stories within this package, run `yarn workspace @automattic/ui run storybook:start`.
