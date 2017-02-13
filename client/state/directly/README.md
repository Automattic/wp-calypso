Directly state
==============

Provides a Redux interface to the imperative [Directly API](../../api/directly).

## Functions
These execute the exported functions from `api/directly` and dispatch related Actions:

#### `initialize( config )`
Initializes the library with the given configuration options. See [the `api/directly`
README](../../api/directly) for config options.

#### `askQuestion( { questionText, name, email } )`
Opens the Directly widget and asks the given question.
