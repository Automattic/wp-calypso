# mobile-app

This module contains a function to identify whether requests are coming from the WordPress mobile apps.

### Usage

Simple usage:

```js
import { isMobileApp } from 'lib/mobile-app';

if ( isMobileApp() ) {
	// Perform a mobile app-specific logic.
}
```