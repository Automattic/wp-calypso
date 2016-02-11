sync-handler
===========

`sync-handler` is an abstraction layer used to sync the data that flowing between 
the client (calypso) and the server (WordPress.com REST-API). It works wrapping 
the request handler of the wpcom.js library which allows it intercept, handler 
and store any requests that the client does.

### How to use

```es6
import { SyncHandler } from 'lib/wp/sync-handler';
import wpcomUndocumented from 'lib/wpcom-undocumented';
import wpcomXHRHandler from 'lib/wpcom-xhr-wrapper';

// wrap the request handler with sync-handler
const handler = new SyncHandler( wpcomXHRHandler );

// create wpcom instance passing the wrapped handler
const wpcom = wpcomUndocumented( handler );
```
