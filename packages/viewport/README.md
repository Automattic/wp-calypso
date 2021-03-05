# viewport

This package contains functions to identify and track changes to the viewport. This can be used for displaying different components depending on a desktop or mobile view.

For React helpers, please check the `@automattic/viewport-react` package.

## Usage

Simple usage:

```js
import { isDesktop, isMobile } from '@automattic/viewport';

if ( isDesktop() ) {
	// Render a component optimized for desktop view
} else if ( isMobile() ) {
	// Render a component optimized for mobile view
}
```

Using one of the other breakpoints:

```js
import { isWithinBreakpoint } from '@automattic/viewport';

if ( isWithinBreakpoint( '>1400px' ) ) {
	// Render a component optimized for a very large screen
} else {
	// Render alternative component
}
```

Registering to listen to changes, using vanilla methods:

```js
import { subscribeIsDesktop } from '@automattic/viewport';

class MyComponent extends React.Component {
	sizeChanged = ( matches ) => {
		console.log( `Screen changed to ${ matches ? 'desktop' : 'non-desktop' } size` );
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

Note: the above usage is more easily accomplished using the hooks and higher-order components in `@automattic/viewport-react`.

## Supported methods

- `isWithinBreakpoint( breakpoint )`: Whether the current screen size matches the breakpoint.
- `isMobile()`: Whether the current screen size matches a mobile breakpoint (equivalent to "<480px"). See note at end of document.
- `isDesktop()`: Whether the current screen size matches a desktop breakpoint (equivalent to ">960px"). See note at end of document.
- `subscribeIsWithinBreakpoint( breakpoint, listener )`: Register a listener for size changes that affect the breakpoint. Returns the unsubscribe function.
- `subscribeIsMobile( listener )`: Register a listener for size changes that affect the mobile breakpoint (equivalent to "<480px"). Returns the unsubscribe function. See note at end of document.
- `subscribeIsDesktop( listener )`: Register a listener for size changes that affect the desktop breakpoint (equivalent to ">960px"). Returns the unsubscribe function. See note at end of document.
- `getWindowInnerWidth()`: Get the inner width for the browser window. **Warning**: This method triggers a layout recalc, potentially resulting in performance issues. Please use a breakpoint instead wherever possible.

## Supported breakpoints

- '<480px'
- '<660px'
- '<782px'
- '<800px'
- '<960px'
- '<1040px'
- '<1280px'
- '<1400px'
- '>480px'
- '>660px'
- '>782px'
- '>800px'
- '>960px'
- '>1040px'
- '>1280px'
- '>1400px'
- '480px-660px'
- '480px-960px'
- '660px-960px'

**Note**: As implemented in Calypso media query mixins, minimums are exclusive, while maximums are inclusive. i.e.:

- '>480px' is equivalent to `@media (min-width: 481px)`
- '<960px' is equivalent to `@media (max-width: 960px)`
- '480px-960px' is equivalent to `@media (max-width: 960px) and (min-width: 481px)`
