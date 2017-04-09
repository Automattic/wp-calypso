Happychat State
==========

A module for managing user state.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.


### `connectChat()`

Opens Happychat Socket.IO client connection. _Note: Most use cases should use the Query Component
[`<HappychatConnection />`](../../components/happychat/connection.jsx) instead of dispatching
this action directly._

### `setChatMessage( message: String )`

Updates the pending message that the user is composing in the Happychat client.

### `sendChatMessage( message: String )`

Sends the message as a chat message to the Happychat service.


## Reducers

The included reducers add the following keys to the global state tree, under `happychat`:

### `timeline`

An array of timeline events as received from the Happychat service.

### `message`

The current message as typed by the customer in the happychat client.

### `status`

The current connection status of the Happychat client

## Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

### `getHappychatConnectionStatus( state: Object )`

Returns the current Happychat client connection status.

### `getHappychatTimeline( state: Object )`

Returns the timeline events for the Happychat chat session.
`
