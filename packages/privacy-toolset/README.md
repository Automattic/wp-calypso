# Components

A library of tools created as React components designed to unify privacy mechanism in Automattic products.

## Installation

1. Install the toolset.

```bash
yarn add @automattic/privacy-toolset
```

2. Add `wp-components` stylesheet

Many components include CSS to add style, you will need to add in order to appear correctly. Within WordPress, add the `wp-components` stylesheet as a dependency of your plugin's stylesheet. See [wp_enqueue_style documentation](https://developer.wordpress.org/reference/functions/wp_enqueue_style/#parameters) for how to specify dependencies.

In non-WordPress projects, link to the `build-style/style.css` file directly, it is located at `node_modules/@wordpress/components/build-style/style.css`.

Source: [@wordpress/components](https://www.npmjs.com/package/@wordpress/components)

## Usage

```jsx
// import the component you wish to use
import { CookieBanner } from '@automattic/privacy-toolset';

const Component = () => (
	<>
		<CookieBanner content={ contentDefinition } onAccept={ fn } />
	</>
);
```

> Disclaimer: for the detailed `content` parameter structure, see `src/cookie-banner/cookie-banner.stories.tsx`.

## Development Workflow

This package is developed as part of the Calypso monorepo. Run `yarn`
in the root of the repository to get the required `devDependencies`.

### Tests

`yarn run test-packages -- packages/privacy-toolset`

`yarn run test-packages:watch -- packages/privacy-toolset`

### Using [Storybook](https://storybook.js.org/)

`yarn workspace @automattic/privacy-toolset run storybook:start`
