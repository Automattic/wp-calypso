Happychat State
===============

Happychat state shape:

- connection
  - error: one of the HAPPYCHAT_CONNECTION_ERROR_* [constants](./constants.js)
  - isAvailable: whether the Happychat service is accepting new chats.
  - status: one of the HAPPYCHAT_CONNECTION_STATUS_* [constants](./constants.js)
- chat
  - status: one of the HAPPYCHAT_CHAT_STATUS_* [constants](./constants.js)
  - lastActivityTimestamp: milliseconds since the ongoing chat received or set a message.
- ui
  - isMinimizing: whether the happychat client is minimizing.
  - isOpen: whether the happychat client is opened.
  - lostFocusAt: milliseconds since the happychat client lost focus.
- user
  - geoLocation
    - city
    - country_long
    - country_short
    - region

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

  ### `initConnection()`

Opens Happychat Socket.IO client connection. _Note: Most use cases should use the Query Component
[`<HappychatConnection />`](../../components/happychat/connection.jsx) instead of dispatching
this action directly._

### `sendMessage( message: String )`

Sends the message as a chat message to the Happychat service.
