Sharing Connections
===================

The Connections components allow a user to add, edit, and remove third-party service providers to their account and/or sites. Historically, this has been primarily focused on the publicize action. Moving forward, we have plans to enable other actions and integrations. For example, we could potentially support integration with Dropbox and allow a user to insert images from their Dropbox directory.

## Component Overview

### SharingConnections

The entry point for sharing connections. Renders help text and a list of `SharingService`.

### SharingService

Renders connection status for a single service, including description, examples, tips, a list of connected accuonts, and possible user actions.

### SharingServiceAction

Renders the primary action for a single SharingConnection (connect, disconnect, or reconnect).

### SharingServiceConnectedAccounts

Renders a list of `SharingConnection` for a specific service to be shown when the service is connected.

### SharingConnection

Renders a single connected account for a service, including profile picture, account name, and disconnect link.

### SharingServiceDescription

Renders a description of a single specified service to be shown when the service panel is not expanded.

### SharingServiceExamples

Renders a list of `SharingServiceExample` to be shown when the specified service is not connected.

### SharingServiceExample

Renders example benefits for a single service.

### SharingServiceTip

Renders a helpful tip to the user on how to get the most out of a service, to be shown when the service is connected.

## Utility

[`service-connections.js`](./service-connections.js) provides a set of helper utility methods to be used in determining the connection status between a service and set of user or site connections.

## Glossary of Terms

### Keyring Connection

When a user authorizes WordPress.com to use their account on a third-party service, an authorization token is stored and referred to as a Keyring token. Keyring tokens themselves are never made publicly visible, and are instead described by Keyring connection objects. A Keyring token can exist without any Publicize connections making use of it, and by storing it independently, we can support multiple Publicize connections using the same Keyring token. Some third-party services have the notion of secondary accounts under the same user (e.g. Facebook pages, Tumblr blogs), and a token grants us access to each of these accounts if the user chooses to grant us access.

While Publicize connections have historically been the primary consumer of Keyring tokens, separating the two allows us to create other types of integrations. For example, in the future we may allow a user to integrate with Dropbox or Instagram so that these can be used as sources of media for their posts.

More information:
- [WordPress.org Keyring plugin](https://wordpress.org/plugins/keyring/)

### Publicize Connection

A Publicize connection is created when a user chooses an account to connect from the options available using the Keyring token associated with a third-party service, so long as the Keyring service supports Publicize. In the context of the connections page, this almost always occurs immediately following the Keyring authorization step, though a user can choose to grant us authorization to their account and never create a connection. By creating a Publicize connection, a user opts in to automatic sharing of new posts to their connected account. For example, if a user creates a Publicize connection for Twitter, each new blog post will be shared automatically to their Twitter feed by default, unless the user chooses not to publicize that particular post.

More information
- [Publicize - WordPress.com Support](https://wordpress.com/support/publicize/)

### Account

Some third-party services have the notion of secondary accounts under the same user (e.g. Facebook pages, Tumblr blogs). By granting us access to their account, a token enables us to create a Publicize connection to either their primary profile or to one of these secondary accounts. A Publicize connection is only created once a user has selected one of the accounts available through the Keyring token associated with the third-party service user. For example, when creating a Publicize connection for Facebook, a user can choose to share posts to their primary profile or to any of the Facebook Pages for which they are an administrator.
