# Sharing

A module for managing a user or site's connection data. Connections are usually intended for sharing and consuming content to and from third-party services. Currently, connections can be classified as either Keyring or Publicize connections. For more information about the distinction between types of connections, refer to the [Sharing Connections Glossery of Terms](../../../client/my-sites/marketing/connections/README.md#glossary-of-terms).

## Publicize

Manage or retrieve details about a site's Publicize connections.

### Reducers

The Publicize reducers add the following keys to the global state tree, under `sharing.publicize`:

#### `fetchingConnections`

An object mapping site ID to connection fetching status for that site.

#### `connections`

All known connections, indexed by connection ID.

### Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

#### `isFetchingConnections`

Returns true if connections are currently fetching for the given site ID.

```js
import { isFetchingConnections } from 'calypso/state/sharing/publicize/selectors';

const connections = isFetchingConnections( store.getState(), 2916284 );
```
