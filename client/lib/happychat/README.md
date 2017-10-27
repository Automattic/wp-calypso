# SocketIO API

The SocketIO API models the SocketIO event flow purely as Redux actions.

## Rationale

By making the SocketIO API Redux-driven, we have several advantages: the API surface is minimal and simpler to reason about (upper layers such as the UI are only concerned with dispatching the proper Redux actions), testability and real-time inspection of the system behavior is greatly improved (just take a look at the Redux dev tools!).

## API

The connection has the following methods:

* `init( ... )`: configure the connection.
* `send( action )`: receives a Redux action and emits the corresponding SocketIO event.
* `request( action, timeout )`: receives a Redux action and emits the corresponding SocketIO event. Unlike send, the event fired takes a callback to be called upon ack, or a timeout callback to be called if the event didn't respond after timeout milliseconds.

### Inbound SocketIO events

Every inbound SocketIO event dispatches its own Redux action, which is namespaced with the `HAPPYCHAT_IO_RECEIVE_EVENTNAME` type and is called `receiveEventName`.

For example:

- the `init` SocketIO event dispatches the `receiveInit` action whose type is `HAPPYCHAT_IO_RECEIVE_INIT`.
- the `message` SocketIO event dispatches the `receiveMessage` action whose type is `HAPPYCHAT_IO_RECEIVE_MESSAGE`.

See `client/state/happychat/connection/actions.js` for a complete list of actions.

### Outbound SocketIO events

Every outbound SocketIO event has a corresponding Redux action. The middleware binds the proper action with the SocketIO API. These Redux actions are namespaced with the `HAPPYCHAT_IO_EMIT_EVENTNAME` type and the action creators name starts by the connection method they are bound to (`init`, `send` or `request`). They also contain props with meta info to be used by the SocketIO API:

* `event`: the SocketIO event name to be used.
* `payload`: the contents to be sent.
* `error`: the message to be shown should an error occurs when trying to emit the event

For example:

* `initConnection( ... )` action creator opens a new connection. It's bound to `connection.init`.
* `sendEvent( ... )` action creator sends a message. It's bound to to `connection.send`.
* `requestTranscript( ... )` action creator requests a transcript. It's bound to `connection.request`.

See `client/state/happychat/connection/actions.js` for a complete list of actions.
