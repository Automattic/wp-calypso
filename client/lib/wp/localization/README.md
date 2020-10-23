# wpcom.js Localization

This module enables the extension of a `wpcom.js` instance to automatically mark wpcom queries for localization. Specifically, the modified instance will add a locale query parameter to wpcom queries so that api responses are properly localized for the user.

## Usage

The helper is already bound for the global instance of `wpcom.js` used in Calypso and should work automatically:

```js
import wpcom from 'calypso/lib/wp';

wpcom
	.site( siteId )
	.postTypesList()
	.then( ( data ) => {
		// `data` is a localized response
	} );
```
