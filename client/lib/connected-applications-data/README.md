Connected Applications Data
======

This component is a wrapper module for interacting with the wpcom.js `/me` endpoint to retrieve a list of connected applications as well as revoke an application's access.

```es6
import ConnectedApplications from 'lib/connected-applications-data';
```

### `ConnectedApplications#get()`
The `get` request will defer to `ConnectedApplications#data` to check for local caches, otherwise calling the `fetch` method.

### `ConnectedApplications#fetch()`
`Fetch` will call `wpcom.me` to get a list of current connected applications for the current user and triggers a `change` event on the object.

### `ConnectedApplications#revoke()`
Given a connected application ID, revoke will call `wpcom.me` to revoke an application's access. Upon success, it will also update the list of connected applications stored `ConnectedApplications#data` as well as emit a `change` event.

### `ConnectedApplications#getApplication()`
Get details for a single connection, given a connection ID.
