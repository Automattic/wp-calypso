# Sharing

A module for managing a user or site's connection data. Connections are usually intended for sharing and consuming content to and from third-party services. Currently, connections can be classified as either Keyring or Publicize connections. For more information about the distinction between types of connections, refer to the [Sharing Connections Glossery of Terms](../../../client/my-sites/marketing/connections/README.md#glossary-of-terms).

## Publicize

Manage or retrieve details about a site's Publicize connections.

### Reducers

The Publicize reducers add the following keys to the global state tree, under `sharing.publicize`:

#### `connections`

All known connections, indexed by connection ID.
