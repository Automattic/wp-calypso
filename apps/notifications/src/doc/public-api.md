# Notifications Public API

Although this notifications panel is fundamentally an independently-operating React component it does impose a few demands on the host component and it additionally specifies a few flags which are used to optimize network polling and bandwidth.

These are specified as React props but for sake of clarity they will be discussed here.

## Signals to App

### locale

The `locale` parameter specifies which display language should be used when viewing the notifications panel. When the component first loads it uses this value to fetch a translation file from the WordPress.com servers (if the language isn't chosen to be `en`).

### wpcom

Since this component doesn't handle authentication it requires that the host component pass along an already-authenticated `wpcom.js` object. See `standalone/auth-wrapper.jsx` for an example of doing this via OAuth.

### isVisible, isOpen - polling

Unless we are listening on a WebSocket connection via `pinghub` we want to throttle the network usage of the component.

<table>
<caption>conditions for the two polling mechanisms</caption>
<thead>
<tr>
<th colspan="2">flags</th>
<th colspan="2">note list polling</th>
</tr>
<th><code>isVisible</code></th>
<th><code>isShowing</code></th>
<th>meta</th>
<th>meta + data</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center"><span style="color: green;">✓</span></td>
<td align="center"><span style="color: green;">✓</span></td>
<td align="center"><span style="color: green;">✓</span></td>
<td align="center"><span style="color: green;">✓</span></td>
</tr>
<tr>
<td align="center"><span style="color: green;">✓</span></td>
<td align="center"><span style="color: red;">✗</span></td>
<td align="center"><span style="color: green;">✓</span></td>
<td align="center"><span style="color: red;">✗</span></td>
</tr>
<tr>
<td align="center"><span style="color: red;">✗</span></td>
<td align="center"><span style="color: green;">✓</span></td>
<td align="center"><span style="color: red;">✗</span></td>
<td align="center"><span style="color: red;">✗</span></td>
</tr>
<tr>
<td align="center"><span style="color: red;">✗</span></td>
<td align="center"><span style="color: red;">✗</span></td>
<td align="center"><span style="color: red;">✗</span></td>
<td align="center"><span style="color: red;">✗</span></td>
</tr>
</tbody>
</table>

#### `isVisible`

Browsers expose a notion of visibility through the `Document.visibilityState` property. This property indicates "if the document is in the background or an invisible tab, or only loaded for pre-rendering." <sup>[1][visibility]</sup>. This means that while we could be in a state where the notifications panel is supposed to be open and displayed, the browser tab might be obscured by other windows or otherwise not actually visible to someone using the computer. In these cases we have no reason to do any polling or updates.

#### `isShowing`

Similar to how `isVisible` indicates a notion of being able to be seen, `isShowing` indicates if the specific React component (this notifications-panel app) is open in the host app. For example, as it's used in Calypso the notifications panel is normally closed behind a bell icon. While we don't need to be polling for the contents of new and updated notes when in this state, we still want to be able to indicate on that bell icon that new notifications have arrives. Therefore we will want to continue to poll for the list of notes (note ids and content hashes) so we can announce those updates while optimizing data usage.

### `refreshNotes`

Used to force a manual refresh of the notes from the server.

## Signals from App

### `iFrameReady` - `onReady() : {}`

Indicates that the notifications panel has booted and is ready to receive messages. This function gets called with no arguments and is used only to indicate that the app has booted. It's probably not needed other than to normalize some interactions when the app loads from inside an iframe and the host window needs to know that it's ready.

### `render` - `onRender() : { latestType: [string], unseen: [int] }`

Indicates that the app has rendered and passes along how many new notifications are unseen. Used to set an indicator bell. If there are unseen notifications the string value of the latest notification type will be passed along also so that a custom bell icon can render.

### `renderAllSeen` - `onRender() : { unseen: 0 }`

Indicates that the app has rendered all notifications and that there are no unseen notifications. Used to reset an indicator bell. This is no different than the normal `onReander()` call except that the number of unseen messages will be zero.

### `togglePanel` - `onToggleRequest() : { toggleState: 'open' | 'closed' }`

Indicates a request to close the notifications panel.

### `widescreen` - `onLayoutChange() : { layout: 'narrow' | 'widescreen' }`

Indicates that the app is toggling from narrow to widescreen layouts. Passes along the boolean `widescreen` to indicate which layout is active.

[visibility]: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState
