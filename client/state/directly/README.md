Directly state
==============

Provides a Redux interface to the imperative [Directly API](../../api/directly).

## Actions
These mirror the `api/directly` module very closely. The following actions are available:

#### `initialize( config )`
Initialize the library with the given configuration options. See [the `api/directly`
README](../../api/directly) for config options.

#### `askQuestion( { questionText, name, email } )`
Open the Directly widget and ask the given question.

#### `scriptLoadFailure( error )`
Indicates that there was a problem loading the Directly scripts.

## Middleware
The middleware watches for Directly action types and engages the Directly API correspondingly.
