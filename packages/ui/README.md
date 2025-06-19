# Components

A library of React components that adhere to the Automattic Design System, to be used across Automattic products.

## Installation

```bash
yarn add @automattic/ui
```

## Usage

You can either import individual components or the entire library.

```tsx
import { Badge } from '@automattic/ui/badge';

<Badge intent="success">Active</Badge>;
```

## Styling

It is assumed that your build system is set up to handle CSS imports. The components import CSS files to apply styles. If you are using a bundler like Webpack or Vite, ensure that you have the appropriate loaders/plugins configured to handle CSS files.

## Development Workflow

This package is developed as part of the Calypso monorepo. Run `yarn`
in the root of the repository to get the required `devDependencies`.

### Tests

`yarn run test-packages`

`yarn run test-packages:watch`

### Using [Storybook](https://storybook.js.org/)

To see stories within this package, run `yarn workspace @automattic/ui run storybook:start`.
