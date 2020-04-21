Popup Monitor
=============

Popup Monitor is a small utility to facilitate the monitoring of a popup window close action, which is especially useful for temporary popup windows (e.g. an authorization step).

## Usage

A Popup Monitor instance offers an `open` function which accepts an identical set of arguments as the standard `window.open` browser offering. When the window is closed, a `close` event is emitted to the instance with the name of the closed window.

```js
import PopupMonitor '@automattic/popup-monitor';

const popupMonitor = new PopupMonitor();

popupMonitor.open( 'https://wordpress.com/', 'my-popup' );

popupMonitor.on( 'close', function( name ) {
	if ( 'my-popup' === name ) {
		console.log( 'Window closed!' );
	}
} );
```

## Methods

- `open( url, name, features )`: Proxies an identical call to `window.open` and begins to monitor the window open state.
- `getScreenCenterSpecs( width, height )`: A helper method for generating a feature (specification) string of a specific width and height at the center of the user's screen.
