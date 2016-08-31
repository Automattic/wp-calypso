Happychat UI State
==================

## Actions

###`openChat()`

Opens the docked happychat client UI

###`closeChat`

Closes the docked happychat client UI

## Reducers

The included reducers add the following keys to the global state tree, under `ui.happychat`:

###`open`

Whether the happychat docked client is displayed

## Selectors

###`isHappychatOpen( state: Object )`

Wether or not the happychat docked UI should be displayed.
