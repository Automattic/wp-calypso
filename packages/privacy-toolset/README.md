# Components

A library of tools React components designed to unify privacy mechanisms in Automattic products.

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
		<CookieBanner content={ ...args } onAccept={ fn } />
	</>
);
```

## Development Workflow

This package is developed as part of the Calypso monorepo. Run `yarn`
in the root of the repository to get the required `devDependencies`.

### Tests

N/A

### Using [Storybook](https://storybook.js.org/)

`yarn workspace @automattic/privacy-toolset run storybook`
