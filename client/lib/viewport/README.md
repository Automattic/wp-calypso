viewport
========

This module contains functions to identify the current viewport. This can be used for displaying different components depending on a desktop or mobile view.

### Usage

```es6
import viewport from 'viewport';

if ( viewport.isDesktop() ) {
	// Render a component optimized for desktop view
} else ( viewport.isMobile() ) {
	// Render a component optimized for mobile view
}
```
