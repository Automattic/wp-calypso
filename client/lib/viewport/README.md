viewport
========

This module contains functions to identify the current viewport. This can be used for displaying different components depending on a desktop or mobile view.

### Usage

Simple usage:

```js
import { isDesktop, isMobile } from 'lib/viewport';

if ( isDesktop() ) {
	// Render a component optimized for desktop view
} else if ( isMobile() ) {
	// Render a component optimized for mobile view
}
```

Using one of the other breakpoints:

```js
import { isWithinBreakpoint } from 'lib/viewport';

if ( isWithinBreakpoint( '>1400px' ) ) {
	// Render a component optimized for a very large screen
} else {
	// Render alternative component
}
```

Registering to listen to changes:

```js
import { subscribeIsDesktop } from 'lib/viewport';

class MyComponent extends React.Component {
	sizeChanged = matches => {
		console.log(
			`Screen changed to ${ matches ? 'desktop' : 'non-desktop' } size` );
		this.forceUpdate();
	};

	componentDidMount() {
		this.unsubscribe = subscribeIsDesktop( this.sizeChanged );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}
}
```

It also comes with React helpers that help in registering a component to breakpoint changes.

Using a hook:

```js
import { useMobileBreakpoint } from 'lib/viewport/react';

export default function MyComponent( props ) {
	const isMobile = useMobileBreakpoint();
	return <div>Screen size: { isMobile ? 'mobile' : 'not mobile' }</div>;
}
```

Using a higher-order component:

```js
import { withMobileBreakpoint } from 'lib/viewport/react';

class MyComponent extends React.Component {
	render() {
		const { isBreakpointActive: isMobile } = this.props;
		return <div>Screen size: { isMobile ? 'mobile' : 'not mobile' }</div>;
	}
}

export default withMobileBreakpoint( MyComponent );
```

### Supported methods

- `isWithinBreakpoint( breakpoint )`: Whether the current screen size matches the breakpoint.
- `isMobile()`: Whether the current screen size matches a mobile breakpoint (<480px).
- `isDesktop()`: Whether the current screen size matches a desktop breakpoint (>960px).
- `subscribeIsWithinBreakpoint( breakpoint, listener )`: Register a listener for size changes that affect the breakpoint. Returns the unsubscribe function.
- `subscribeIsMobile( listener )`: Register a listener for size changes that affect the mobile breakpoint (<480px). Returns the unsubscribe function.
- `subscribeIsDesktop( listener )`: Register a listener for size changes that affect the desktop breakpoint (>960px). Returns the unsubscribe function.
- `getWindowInnerWidth()`: Get the inner width for the browser window. **Warning**: This method triggers a layout recalc, potentially resulting in performance issues. Please use a breakpoint instead wherever possible.

### Supported hooks

- `useBreakpoint( breakpoint )`: Returns the current status for a breakpoint, and keeps it updated.
- `useMobileBreakpoint()`: Returns the current status for the mobile breakpoint, and keeps it updated.
- `useDesktopBreakpoint()`: Returns the current status for the desktop breakpoint, and keeps it updated.

### Supported higher-order components

- `withBreakpoint( breakpoint )( WrappedComponent )`: Returns a wrapped component with the current status for a breakpoint as the `isBreakpointActive` prop.
- `withMobileBreakpoint( WrappedComponent )`: Returns a wrapped component with the current status for the mobile breakpoint as the `isBreakpointActive` prop.
- `withDesktopBreakpoint( WrappedComponent )`: Returns a wrapped component with the current status for the desktop breakpoint as the `isBreakpointActive` prop.

### Supported breakpoints

- '<480px'
- '<660px'
- '<800px'
- '<960px'
- '<1040px'
- '<1280px'
- '<1400px'
- '>480px'
- '>660px'
- '>800px'
- '>960px'
- '>1040px'
- '>1280px'
- '>1400px'
- '480px-660px'
- '480px-960px'
- '660px-960px'

**Note**: As implemented in our Sass media query mixins, minimums are exclusive, while maximums are inclusive. i.e.:

- '>480px' is equivalent to `@media (min-width: 481px)`
- '<960px' is equivalent to `@media (max-width: 960px)`
- '480px-960px' is equivalent to `@media (max-width: 960px) and (min-width: 481px)`
