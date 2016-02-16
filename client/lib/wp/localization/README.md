wpcom.js Localization
=====================

This module enables the extension of a `wpcom.js` instance to include localization helper functions. Specifically, the modified instance will include a new `withLocale` function, which will result in the subsequent chained request being localized according to the current user's preferred locale.

## Usage

The helper is already bound for the global instance of `wpcom.js` used in Calypso. To take advantage of the localization helpers, call the `withLocale` function at the start of your request chain.

```js
import wpcom from 'lib/wp';

wpcom.withLocale().site( siteId ).postTypesList().then( ( data ) => {
	// `data` is a localized response
} );
```
