Sharing
=========

Small utility library for requesting authorization of sharing services.

## Usage

```es6
import requestExternalAccess from 'lib/sharing';

requestExternalAccess( service.connect_URL, () => {
	// Do something after the authorization window has closed
} );
```
