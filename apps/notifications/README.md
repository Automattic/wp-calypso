Notifications
=============

The _**notifications panel**_ (also known as "masterbar notifications" and "the bell notifications") is a cross-environment app that runs directly inside of Calypso and in an `iframe` on WordPress.com sites which aren't Calypso.

This module is where the code for the notifications panel lives. Calypso views are imported as normal `node` imports while the `iframe` version is served from `https://widgets.wp.com/notes`.

## Building and developing

Most work on the notifications panel should happen in Calypso the same way other Calypso changes are developed.
That is, you can work in these files and rely on the normal Calypso dev server.
**However** things are often different inside the `iframe` in unexpected ways and so we need to verify that any changes apply properly in both environments.

CircleCI generates notifications panel build artifacts on every commit that it processes.
Alternatively you can manually build the app with `lerna` and copy the built files to your sandbox.

```bash
# Builds files and places them in `apps/notifications/dist`
cd apps/notifications
yarn build
```

You will need to follow the directions in the Field Guide to deploy these artifacts.

## iframe communication

When running in an iframe communication with the parent frame occurs through a `postMessage()` exchange.

Messages we handle from the notifications iframe have the form:

```js
{
	type: "notesIframeMessage",
	action: < varies >,
	//... other properties depending on action ...
}
```

- `togglePanel`: This is a message from the client that the panel open state
  should be toggled. For example, the user may have pressed the ESC key, which
  means we should close the panel.

- `iFrameReady`: The client sends this message when it's code has loaded and
it is ready to begin polling for notifications.

- `renderAllSeen`: A message to indicate that the user has seen all
  notifications (so we can clear the new notifications indicator).

- `widescreen`: The client is requesting that it's frame width be changed. We
  use this to set the appropriate classes so the notifications frame is rendered
  wider when the user clicks into the detail view of a note or narrower when
  they close the detail view. When receiving this action, there will be a
  boolean property `widescreen` indicating if widescreen mode should be on or
  not.

- `render`: Client sends this when the number of new notes changes. The property
  `num_new` will indicate the number of new notes available (possibly 0). The
  type of the latest note will also be available as a string in `latest_type`.
