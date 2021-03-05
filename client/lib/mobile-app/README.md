# mobile-app

This module contains a function to identify whether requests are coming from the WordPress mobile apps.

## Usage

Simple usage:

```js
import { isWpMobileApp } from 'calypso/lib/mobile-app';

if ( isWpMobileApp() ) {
	// Perform a mobile app-specific logic.
}
```
