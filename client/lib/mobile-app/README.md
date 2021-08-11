# mobile-app

This module contains a function to identify whether requests are coming from the WordPress or WooCommerce mobile apps.

## Usage

WordPress usage:

```js
import { isWpMobileApp } from 'calypso/lib/mobile-app';

if ( isWpMobileApp() ) {
	// Perform a mobile app-specific logic.
}
```

WooCommerce usage:

```js
import { isWcMobileApp } from 'calypso/lib/mobile-app';

if ( isWcMobileApp() ) {
	// Perform a mobile app-specific logic.
}
```
