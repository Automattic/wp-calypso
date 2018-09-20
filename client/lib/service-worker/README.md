Service Worker
======

#### How to use

```js
import {
	isServiceWorkerSupported,
	registerServerWorker,
} from 'lib/service-worker';

if ( isServiceWorkerSupported() ) {
	registerServerWorker();
}
```

## Statically served worker file
`./service-worker.js` is served at `/service-worker.js`

A "Nice-to-have" would be to leverage our build system such that we can modularly add to the service worker javascript file we serve & use ES6+ syntax, imports, etc.
