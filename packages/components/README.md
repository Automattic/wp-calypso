# Components

A library of React components designed for use in Automattic products.

## Installation

Install the components and the color schemes they depend on.

```bash
npm i -S @automattic/components @automattic/calypso-color-schemes
```

## Usage

```jsx
// import the color variables - you only need to do this once in your entire application
import '@automattic/calypso-color-schemes/dist/calypso-color-schemes.css';

// import the component you wish to use
import { Button } from '@automattic/components';

const CallToAction = () => (
	<>
		<Button primary onClick={() => alert('Thank you for taking action!')}>Take action now!</Button>
	</>
);

```

## Development Workflow

This package is developed as part of the Calypso monorepo. Run `npm install`
in the root of the repository to get the required `devDependencies`.

### Tests

```npm run test-packages```

```npm run test-packages:watch```

### Using [Storybook](https://storybook.js.org/)

```npm run components:storybook:start```
