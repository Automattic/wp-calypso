# Component Tests

Calypso has a lot of React UI components. (Try for example running `find . -name '*.js?'` from the `client` folder).  It can be difficult to test components and UI. This guide will help make it as easy and focused as possible.

## [Getting started](#getting-started)

To run all current client side tests, run `yarn run test-client` from within the Calypso source. You can also run individual tests, see [Testing overview](testing-overview.md#how-to-run-a-smaller-subset-of-test-files) for more details.

Going through the current tests is a good way to get ideas for how different kinds of things can be tested.

### [Set up a test environment](#setting-up-environment)

It's very possible that your tests will assume the existence of a browser environment to work properly. The test runner we use, [Jest](https://facebook.github.io/jest), uses the browser-like environment [jsdom](https://github.com/tmpvar/jsdom). We default to a node-like environment to make tests faster. If some tests require another environment, you can add `/** @jest-environment jsdom */` docblock. Check [this Jest doc](https://facebook.github.io/jest/docs/en/configuration.html#testenvironment-string) to learn more.

### [What to test?](#what-to-test)

This obviously varies between components, but a few easy things to start out with:

#### Does rendering the component produce expected results

Like its child components?

```javascript
import { shallow } from 'enzyme';
import MyComponent from 'my-component';
import AnExpectedChildComponent from 'an-expected-child-component';

test( 'should have AnExpectedChildComponent as a child of MyComponent', () => {
	const wrapper = shallow( <MyComponent /> );
	expect( wrapper ).toMatchSnapshot();
	expect( wrapper.find( AnExpectedChildComponent ) ).toHaveLength( 1 );
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

Example test from `client/components/Accordion`:

```javascript
test( 'should accept an onToggle function handler to be invoked when toggled', () => {
	const toggleSpy = jest.fn();
	const wrapper = shallow(
		<Accordion title="Section" onToggle={ toggleSpy }>
			Content
		</Accordion>
	);

	wrapper.find( '.accordion__toggle' ).simulate( 'click' );

	expect( toggleSpy ).toHaveBeenCalledTimes( 1 );
	expect( toggleSpy ).toHaveBeenCalledWith( true );
	expect( wrapper.state( 'isExpanded' ) ).toBe( true );
} );
```

## [Techniques for avoiding calling other than the targeted code](#techniques-for-avoiding-calling-other-code)

Like their name suggests, unit tests should be targeting only one clear unit at a time. Try to minimize the amount of code you're calling outside the targeted code. This other code could be for example subcomponents, mixins, or just other functions than the one you're testing.

### [Shallow rendering](#shallow-rendering)

Shallow rendering helps with inspecting whether our component renders correctly, without having to render subcomponents. Lets hear it from Facebook themselves:

> When writing unit tests for React, shallow rendering can be helpful. Shallow rendering lets you
> render a component “one level deep” and assert facts about what its render method returns,
> without worrying about the behavior of child components, which are not instantiated or rendered.
> This does not require a DOM.
>
> https://reactjs.org/docs/shallow-renderer.html#overview

For a complete example of usage, see `client/components/themes-list/test/index.jsx`.

The render function basically just draws a bunch of Theme sub-components:

```javascript
class ThemesList extends React.Component {
	// …
	render() {
		return (
			<div className="themes-list">
				{ this.props.themes.map( function( theme ) {
					return (
						<Theme key={ 'theme' + theme.name }>
							<Theme theme={ theme } />
					);
				} ) }
			</div>
		);
	}
}
```

So we test it like this:

```javascript
import EmptyContent from 'components/empty-content';
import Theme from 'components/theme';
import { shallow } from 'enzyme';
import { ThemesList } from '../';

const defaultProps = deepFreeze( {
	themes: [
		{ id: '1', name: 'kubrick', screenshot: '/theme/kubrick/screenshot.png' },
		{ id: '2', name: 'picard', screenshot: '/theme/picard/screenshot.png' },
	],
	// …
} );

	test( 'should render a div with a className of "themes-list"', () => {
		const wrapper = shallow( <ThemesList { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.hasClass( 'themes-list' ) ).toBe( true );
		expect( wrapper.find( Theme ) ).toHaveLength( defaultProps.themes.length );
	} );

	test( 'should render a <Theme /> child for each provided theme', () => {
		const wrapper = shallow( <ThemesList { ...defaultProps } /> );
		expect( wrapper.find( Theme ) ).toHaveLength( defaultProps.themes.length );
	} );

	test( 'should display the EmptyContent component when no themes are provided', () => {
		const wrapper = shallow( <ThemesList { ...defaultProps } themes={ [] } /> );
		expect( wrapper.type() ).toBe( EmptyContent );
	} );
```

By using `shallow`, we avoid rendering the `Theme` components when testing `ThemesList`.

## Troubleshooting

* Valid tests can fail if a component is wrapped in a higher order component, like `localize()` or `connect()`. This is because a shallow render only results in the higher component being rendered, not its children.

The best practice is to test the unwrapped component, with external dependencies mocked, so that the results aren't influenced by anything outside the component being tested:

```javascript
// Bad. Tests cannot access the unwrapped component.
export default localize( class SomeComponent extends React.Component {
	// ...
} );
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
