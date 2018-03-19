Tracks Opt-out
==============

The Tracks opt out component is used in the main layout to make sure that any
changes to user settings are taken into account as soon as possible. It should
also handle cases when the opt-out was set outside of this Calypso session, for
instance in the mobile apps or in another browser.

### index.jsx

This component subscribes to `userSettings`'s `change` events. It then sends a
`setOptOut` command to the Tracks JS library in `w.js`.

NOTE: This component does not accept any children, nor does it render any
elements to the page.
