A little bridge that consumes the current redux store and exposes the dispatch method as a singleton.

This helps flux and thunk action handlers move to redux in an incremental fashion.

NOTE: _Please don't use it as a general purpose method to get access to redux's dispatch._
