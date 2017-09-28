# Audio handler

## Overview

This handler plays audio when certain Redux actions are dispatched. This can be useful for adding
audio feedback when some event occurs in Calypso.

For example, the initial use of this is to play a notification sound when a new message is received in Happychat.

Only browsers supporting the [`new Audio()` API](https://developer.mozilla.org/en/docs/Web/API/HTMLAudioElement)
will play a sound, other browsers will ignore this middleware. Currently works on Chrome, Edge,
Firefox, and Safari.
