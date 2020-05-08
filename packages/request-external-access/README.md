Request External Access
=======================

Utility for requesting external access using the popup window.

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
