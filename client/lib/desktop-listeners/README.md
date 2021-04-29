# Desktop

Provides an interface between Calypso and [Electron](https://github.com/atom/electron) using Electron's [IPC](https://github.com/atom/electron/blob/HEAD/docs/api/ipc-main.md) mechanism.

Note this module only runs when the `desktop` feature is enabled. The `ipc` module is defined as an external in Calypso, and so will only
run inside Electron (where `ipc` is defined).

## Input Events

The following events can be sent to Calypso from Electron via IPC:

- `page-my-sites` - Navigate to the My Sites page
- `page-reader` - Navigate to the Reader page
- `page-profile` - Navigate to the user's profile page
- `new-post` - Trigger a Calypso new post event
- `signout` - Trigger a Calypso sign out event
- `toggle-notification-bar` - Toggle the visibility of the notification client
- `cookie-auth-complete` - Forces the notification client to refresh (with new cookie details)
- `page-help` - Navigate to the help page

## Output Events

The following events are sent from Calypso to Electron via IPC:

- `render( context )` - Sent when the `page` is changed (context is the [`page` context](https://visionmedia.github.io/page.js/#context))
- `unread-notices-count( count )` - Sent whenever the unread notification count changes and contains the latest unread count
- `editor-iframe-loaded` - Sent when the post editor (Gutenberg or classic/TinyMCE) iframe is loaded

These events are sent once at startup:

- `user-login-status( loggedIn )` - A boolean indicating whether the user is logged in
- `user-auth( user, oAuthToken )` - Sends the Calypso user and OAuth token (both may be false)
