Happychat State
==========

Happychat state shape is:

- connection
  - error: one of the HAPPYCHAT_CONNECTION_ERROR_* [constants](./constants.js)
  - isAvailable: whether the Happychat service is accepting new chats.
  - status: one of the HAPPYCHAT_CONNECTION_STATUS_* [constants](./constants.js)
- chatStatus
- lastActivityTimestamp
- lostFocusAt
- message: current message as typed by the customer in the happychat client.
- timeline: array of timeline messages, as received from the Happychat service.
- geoLocation

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


## Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

### `getHappychatConnectionStatus( state: Object )`

Returns the current Happychat client connection status.

### `getHappychatTimeline( state: Object )`

Returns the timeline events for the Happychat chat session.
`
