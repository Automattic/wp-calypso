# Sharing

A module for managing a user or site's connection data. Connections are usually intended for sharing and consuming content to and from third-party services. Currently, connections can be classified as either Keyring or Publicize connections. For more information about the distinction between types of connections, refer to the [Sharing Connections Glossery of Terms](../../../client/my-sites/marketing/connections/README.md#glossary-of-terms).

## Publicize

Manage or retrieve details about a site's Publicize connections.

### Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

#### `fetchConnections`

Triggers a network request to retrieve Publicize connections for the specified site ID from the WordPress.com REST API.

```js
import { fetchConnections } from 'calypso/state/sharing/publicize/actions';

dispatch( fetchConnections( 2916284 ) );
```

### Reducers

The Publicize reducers add the following keys to the global state tree, under `sharing.publicize`:

#### `fetchingConnections`

An object mapping site ID to connection fetching status for that site.

#### `connections`

All known connections, indexed by connection ID.

### Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

#### `getConnectionsBySiteId`

Returns an array of known connections for the given site ID.

```js
import { getConnectionsBySiteId } from 'calypso/state/sharing/publicize/selectors';

const connections = getConnectionsBySiteId( store.getState(), 2916284 );
```

#### `hasFetchedConnections`

Returns true if connections have been fetched for the given site ID.

```js
import { hasFetchedConnections } from 'calypso/state/sharing/publicize/selectors';

const connections = hasFetchedConnections( store.getState(), 2916284 );
```

#### `isFetchingConnections`

Returns true if connections are currently fetching for the given site ID.

```js
import { isFetchingConnections } from 'calypso/state/sharing/publicize/selectors';

const connections = isFetchingConnections( store.getState(), 2916284 );
```
