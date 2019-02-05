viewport
========

This module contains functions to identify the current viewport. This can be used for displaying different components depending on a desktop or mobile view.

### Usage

Simple usage:

```js
import { isDesktop, isMobile } from 'viewport';

if ( isDesktop() ) {
	// Render a component optimized for desktop view
} else ( isMobile() ) {
	// Render a component optimized for mobile view
}
```

Using one of the other breakpoints:

```js
import { isWithinBreakpoint } from 'viewport';

if ( isWithinBreakpoint( '>1400px' ) ) {
	// Render a component optimized for a very large screen
} else {
	// Render alternative component
}
```

Registering to listen to changes:

```js
import { addIsDesktopListener, removeIsDesktopListener } from 'viewport';

class MyComponent extends React.Component {
	sizeChanged = matches => {
		console.log(
			`Screen changed to ${ matches ? 'desktop' : 'non-desktop' } size` );
		this.forceUpdate();
	};

	componentDidMount() {
		addIsDesktopListener( this.sizeChanged );
	}

	componentWillUnmount() {
		removeIsDesktopListener( this.sizeChanged );
	}
}
```

### Supported methods

- `isWithinBreakpoint( breakpoint )`: Whether the current screen size matches the breakpoint
- `isMobile()`: Whether the current screen size matches a mobile breakpoint (<480px)
- `isDesktop()`: Whether the current screen size matches a desktop breakpoint (>960px)
- `addWithinBreakpointListener( breakpoint, listener )`: Register a listener for size changes that affect the breakpoint
- `removeWithinBreakpointListener( breakpoint, listener )`: Unregister a previously registered listener
- `addIsMobileListener( breakpoint, listener )`: Register a listener for size changes that affect the mobile breakpoint (<480px)
- `removeIsMobileListener( breakpoint, listener )`: Unregister a previously registered listener
- `addIsDesktopListener( breakpoint, listener )`: Register a listener for size changes that affect the desktop breakpoint (>960px)
- `removeIsDesktopListener( breakpoint, listener )`: Unregister a previously registered listener
- `getWindowInnerWidth()`: Get the inner width for the browser window. **Warning**: This method triggers a layout recalc, potentially resulting in performance issues. Please use a breakpoint instead wherever possible.

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
