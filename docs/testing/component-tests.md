# Component Tests

Calypso has a lot of React UI components. (Try for example running `find . -name '*.js?'` from the `client` folder). It can be difficult to test components and UI. This guide will help make it as easy and focused as possible.

## [Getting started](#getting-started)

To run all current client side tests, run `yarn run test-client` from within the Calypso source. You can also run individual tests, see [Testing overview](testing-overview.md) for more details.

Going through the current tests is a good way to get ideas for how different kinds of things can be tested.

### [Set up a test environment](#setting-up-environment)

It's very possible that your tests will assume the existence of a browser environment to work properly. The test runner we use, [Jest](https://facebook.github.io/jest), uses the browser-like environment [jsdom](https://github.com/jsdom/jsdom). We default to a node-like environment to make tests faster. If some tests require another environment, you can add `/** @jest-environment jsdom */` docblock. Check [this Jest doc](https://facebook.github.io/jest/docs/en/configuration.html#testenvironment-string) to learn more.

### [What to test?](#what-to-test)

This obviously varies between components, but a few easy things to start out with:

#### Does rendering the component produce expected results

Like its child components?

```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from 'my-component';

test( 'should have Dialog as a child of MyComponent', () => {
	const { container } = render( <MyComponent /> );
	expect( container ).toMatchSnapshot();
	expect( screen.getByRole( 'dialog' ) ).toBeVisible();
} );
```

#### Are props passed around correctly

Continuing the example from above

```javascript
expect( wrapper.find( AnExpectedChildComponent ).props( 'fantastic' ) ).toBe( true );
```

#### The React class's functions

Often there are individually testable functions within React classes. You can access the individual function through the class's prototype.

```javascript
expect( MyComponent.prototype.appendWorldBang( 'Hello, ' ) ).toBe( 'Hello, world!' );
```

Or by accessing the wrapper's `instance()`:

```javascript
expect( wrapper.instance().shouldShowPlaceholder() ).toBe( true );
```

#### Is interaction handled correctly

When a user for example clicks an element does the component react like it should?

Example test from `calypso/client/components/token-field`:

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test( 'should remove tokens when X icon clicked', async () => {
	const user = userEvent.setup();
	render( <TokenFieldWrapper /> );
	await user.click( screen.getAllByRole( 'button', { name: 'Remove' } )[ 0 ] );
	const tokenField = screen.getByRole( 'textbox', { name: 'Your Field' } );
	expect( tokenField ).toHaveValue( 'bar' );
} );
```

## [Techniques for avoiding calling other than the targeted code](#techniques-for-avoiding-calling-other-code)

Like their name suggests, unit tests should be targeting only one clear unit at a time. Try to minimize the amount of code you're calling outside the targeted code. This other code could be for example subcomponents, mixins, or just other functions than the one you're testing.

### [Mocking child components](#mocking-child-components)

Sometimes it's useful to inspect whether our component renders correctly without exercising the behavior of its subcomponents. With `@testing-library/react` there is no equivalent of Enzyme's `shallow` renderer; the recommended technique is to stub child components with `jest.mock` so only the component under test runs its real code.

For a complete example of usage, see `client/components/themes-list/test/index.jsx`.

The render function basically just draws a bunch of Theme sub-components:

```javascript
class ThemesList extends React.Component {
	// …
	render() {
		return (
			<div className="themes-list">
				{ this.props.themes.map( function ( theme ) {
					return <Theme key={ 'theme' + theme.name } theme={ theme } />;
				} ) }
			</div>
		);
	}
}
```

So we test it like this:

```javascript
import { screen } from '@testing-library/react';
import deepFreeze from 'deep-freeze';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ThemesList } from '../';

jest.mock( 'calypso/components/theme', () => ( { theme } ) => (
	<div data-testid={ `theme-${ theme.id }` } />
) );

const defaultProps = deepFreeze( {
	themes: [
		{ id: '1', name: 'kubrick', screenshot: '/theme/kubrick/screenshot.png' },
		{ id: '2', name: 'picard', screenshot: '/theme/picard/screenshot.png' },
	],
	// …
} );

test( 'should render a div with a className of "themes-list"', () => {
	const { container } = renderWithProvider( <ThemesList { ...defaultProps } /> );
	expect( container.firstChild ).toHaveClass( 'themes-list' );
} );

test( 'should render a <Theme /> child for each provided theme', () => {
	renderWithProvider( <ThemesList { ...defaultProps } /> );
	expect( screen.getAllByTestId( /theme-/ ) ).toHaveLength( defaultProps.themes.length );
} );

test( 'should display a message when no themes are found', () => {
	renderWithProvider( <ThemesList { ...defaultProps } themes={ [] } /> );
	expect( screen.getByText( /No themes match your search/i ) ).toBeInTheDocument();
} );
```

By mocking `calypso/components/theme` with `jest.mock`, we avoid rendering the real `Theme` components when testing `ThemesList`.

## Troubleshooting

- Valid tests can fail if a component is wrapped in a higher order component, like `localize()` or `connect()`. This is because a shallow render only results in the higher component being rendered, not its children.

The best practice is to test the unwrapped component, with external dependencies mocked, so that the results aren't influenced by anything outside the component being tested:

```javascript
// Bad. Tests cannot access the unwrapped component.
export default localize(
	class SomeComponent extends React.Component {
		// ...
	}
);
```

```javascript
// Good! This component can imported for testing.
export class SomeComponent extends React.Component {
	// ...
}

// The default export wrapped component can be imported for use elsewhere.
export default localize( SomeComponent );
```

See [#18064](https://github.com/Automattic/wp-calypso/pull/18064) for full examples of using ES6 classes.

## Enzyme support

Historically, we used to support [`enzyme`](https://github.com/enzymejs/enzyme), but support was dropped in favor of `@testing-library/react`, the primary reason being the fact that it was incompatible with React 18, which Calypso now uses. There were additional motivations, like being able to write more accessible tests and being able to test closer to what the user actually experiences.

Previously, `enzyme` was provided by the `@automattic/calypso-jest` package as part of the testing infrastructure. Nowadays, in the Calypso monorepo, it's recommended to use `@testing-library/react` for component tests.

If you wish to use `enzyme` in your project that uses a Calypso package, you can still use it by manually providing the React 17 adapter, by following the steps below. Note that it's likely that Enzyme still doesn't support React 18 yet.

To install the enzyme dependency, run:

```bash
npm install --save enzyme
```

To install the React 17 adapter dependency, run:

```bash
npm install --save @wojtekmaj/enzyme-adapter-react-17
```

To use the React 17 adapter, use this in your [`setupFilesAfterEnv`](https://jestjs.io/docs/configuration#setupfilesafterenv-array) configuration:

```javascript
// It "mocks" enzyme, so that we can delay loading of
// the utility functions until enzyme is imported in tests.
// Props to @gdborton for sharing this technique in his article:
// https://medium.com/airbnb-engineering/unlocking-test-performance-migrating-from-mocha-to-jest-2796c508ec50.
let mockEnzymeSetup = false;
jest.mock( 'enzyme', () => {
	const actualEnzyme = jest.requireActual( 'enzyme' );
	if ( ! mockEnzymeSetup ) {
		mockEnzymeSetup = true;
		// Configure enzyme 3 for React, from docs: http://airbnb.io/enzyme/docs/installation/index.html
		const Adapter = jest.requireActual( '@wojtekmaj/enzyme-adapter-react-17' );
		actualEnzyme.configure( { adapter: new Adapter() } );
	}
	return actualEnzyme;
} );
```

If you also use snapshot tests with `enzyme`, you might want to add support for serializing them, through the `enzyme-to-json` package.

To install the dependency, run:

```bash
npm install --save enzyme-to-json
```

Finally, you should add `enzyme-to-json/serializer` to the array of [`snapshotSerializers`](https://jestjs.io/docs/configuration#snapshotserializers-arraystring) in your `jest` configuration:

```
{
	snapshotSerializers: [ 'enzyme-to-json/serializer' ]
}
```
