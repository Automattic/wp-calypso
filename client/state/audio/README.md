# Audio Middleware

## Overview

This middleware plays audio when certain Redux actions are dispatched. This can be useful for adding
audio feedback when some event occurs in Calypso.

For example, the initial use of this is to play a notification sound when a new message is received in Happychat.

Only browsers supporting the [`new Audio()` API](https://developer.mozilla.org/en/docs/Web/API/HTMLAudioElement)
will play a sound, other browsers will ignore this middleware. Currently works on Chrome, Edge,
Firefox, and Safari.

## Playing a sound

To play a sound when an action is dispatched, add a new handler in `./middleware.js`:

For example, if a sound should be played when an action of type `SOME_ACTION_TYPE` is dispatched, add the
following:

### `./middleware.js`

```js
export const onSomeEvent = ( dispatch, action ) => {
	playSound( '/calypso/audio/sound-to-play.wav' );
};

// ...

/**
 * Action Handlers
 */

// ...

handlers[ SOME_ACTION_TYPE ] = onSomeEvent;
```
