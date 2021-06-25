# Request External Access

Utility for requesting authorization of sharing services.

## Usage

```js
import requestExternalAccess from '@automattic/request-external-access';

requestExternalAccess( serviceURL, ( { keyring_id } ) => {
	if ( ! keyring_id ) {
		return;
	}

	newKeyringConnection( keyring_id );
} );
```
