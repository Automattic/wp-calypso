Notifications
=============

This module handles loading the notifications view. Currently we load this as an iframe from https://widgets.wp.com/notes/. Future versions may include the notifications module directly.
This module also mediates communication between us and the iframe notifications client using `postMessage()`.

Messages we handle from the notifications iframe have the form:

    {
    "type" : "notesIframeMessage",
    "action" : < varies >,
    ... other properties depending on action ...
    }


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
