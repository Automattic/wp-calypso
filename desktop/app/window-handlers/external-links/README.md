# External Links

Hooks into the `will-navigate` events and `setWindowOpenHandler` to override Calypso behavior.

The following rules are applied:

- Requests to open a new window (`target="_blank"` links, `window.open()`) load in the main view instead
- The Google social login popup is allowed to open a new Electron window
