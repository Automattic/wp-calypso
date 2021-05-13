# safeImageUrl

This is a small module that takes a URL to a supposed image and returns a safe
version of it, guaranteed to be hosted by Automattic. If the URL appears to be
from an Automattic-controlled CDN, it is simply upgraded to HTTPS if necessary.
If it is not on an Automattic-controlled CDN, the URL is routed through photon.

## Example

```js
import safeImageUrl from 'calypso/lib/safe-image-url';

safeImageUrl( '//example.com/foo.png' );
// "https://i1.wp.com/example.com/foo.png"
```
