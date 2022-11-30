# Components

A library of tools created as React components designed to unify privacy mechanism in Automattic products.

## Installation

Install the toolset.

```bash
yarn add @automattic/privacy-toolset
```

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

> Disclaimer: see the detailed `content` parameter structure, see `src/cookie-banner/cookie-banner.stories.tsx`.

## Development Workflow

This package is developed as part of the Calypso monorepo. Run `yarn`
in the root of the repository to get the required `devDependencies`.

### Tests

`yarn run test-packages -- packages/privacy-toolset`

`yarn run test-packages:watch -- packages/privacy-toolset`

### Using [Storybook](https://storybook.js.org/)

`yarn workspace @automattic/privacy-toolset run storybook`
