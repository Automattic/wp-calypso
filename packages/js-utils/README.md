# JavaScript utils

This is a collection of general purpose JavaScript utility functions.

## Important note

This package was created to help with Lodash removal in Calypso in the first place and is currently
not intended to be used outside of Calypso. Functions currently in here may be removed in the future
without further notice.

Most functions mirror the API of their Lodash equivalent so they can replace existing call sites
directly, but they are intentionally narrower. Each function's doc comment describes only where its
behavior diverges (for example: no iteratee shorthands, ASCII-only, dense arrays). Assume anything
not called out matches the corresponding Lodash function for the inputs Calypso actually passes.

Second, we want to think very carefully about what functions to add and which not. A lot of Lodash
functionality these days can be replaced by native JavaScript code and that should be the premise.
In case you still want to add a function here please open a Pull Request which describes your use-case
and ping @Automattic/team-calypso for a review.
