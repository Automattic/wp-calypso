restore-last-path
=================

This library is used to read and write the last location to which the client device browsed & (if conditions are right) restore that device to the previous location when it browses to the root (`/`) for the first time in a session.

The behavior here is subject to change as we discover smarter ways to predict where people want to be when they return.

Path Whitelist
--------------

There is a REGEX-based subset of paths that are whitelisted for saving (& subsequent restore).

`restoreLastSession`
-----------------------

This is called early in the [loading process](/server/bundler/loader.js) to attempt to restore a device to the last path it visited (if valid). It returns a boolean value so the caller knows whether to return (i.e. the path is being restored) or continue (it is not).

`savePath`
-----------------------

Validates the passed path & saves it to the local device for future retrieval.
Asynchronous -- it returns a `Promise`.
