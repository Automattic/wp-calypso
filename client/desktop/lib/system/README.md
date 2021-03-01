# System

Provides details of the host system. These details are then sent to Calypso so it has some knowledge of where it is running.

## General functions

`getDetails()` - returns detail object

Where:

- `pinned` - true if app is pinned to the dock (OS X only, other platforms return false)

- `installed` - true if app is installed, false otherwise (OS X only, other platforms return true)

- `platform` - returns `windows`, `darwin`, or `linux`

- `firstRun` - returns true if this is the first time the app has run, false otherwise
