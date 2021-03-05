# Signup

Handles all reducers that are related to the Signup process.

More information about why it is organized in stores and not proper Redux flow can be seen [here](https://github.com/Automattic/wp-calypso/issues/6709)

## SignupDependencyStore - `dependency-store`

Holds the reducers that take care of the data passed to `SignupDependencyStore`, which is now saved in Redux, instead of `localStorage`.

It has only two actions, because these are the only actions that actually happen in `SignupDependencyStore`:

- `SIGNUP_DEPENDENCY_STORE_UPDATE` - update store data with new values
- `SIGNUP_COMPLETE_RESET` - clear out the store

## `optional-dependencies`

Holds optional data that is used between the steps, outside of the defined `dependencies`, which are stored inside `SignupDependencyStore`.

Each piece of data is defined as a separate reducer.

- `SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET` - Username suggestion based on the chosen domain name during Signup. [PR for more information](https://github.com/Automattic/wp-calypso/pull/6596)
