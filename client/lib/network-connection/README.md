# Network connection

`Network connection` provides simple UI for the cases when the user lost connection to the internet or to our servers.

## How to use

Public API can be used through main file:

```js
import NetworkConnectionApp from 'calypso/lib/network-connection';
```

To init default handler which shows/hides error notice when connection lost/restored simply call:

```js
NetworkConnectionApp.init();
```

Network connection keeps current network connection status. To check it use:

```js
NetworkConnectionApp.isConnected();
```

## Sending events

There are to methods that can be used to emit connection status change.

When you want to notify from any connection handler that connection is active call:

```js
NetworkConnectionApp.emitConnected();
```

When you want to notify that network connection has been lost use:

```js
NetworkConnectionApp.emitDisconnected();
```

## Responding to events

It is possible to listen for network connection status change. Events will be fired only when connection changes status from connected to disconnected or other way around.

This will handle the case when user gets reconnected:

```js
NetworkConnectionApp.on( 'connected', function () {
	console.log( 'Connection restored!' );
} );
```

This will handle the case when user gets disconnected:

```js
NetworkConnectionApp.on( 'disconnected', function () {
	console.log( 'Connection lost!' );
} );
```
