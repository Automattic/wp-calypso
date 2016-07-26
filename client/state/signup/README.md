Signup
====

Handles all reducers that are related to the Signup process.

More information about why it is organized in stores and not proper Redux flow can be seen [here](https://github.com/Automattic/wp-calypso/issues/6709)


### SignupDependencyStore - `dependency-store`

Holds the reducers that take care of the data passed to `SignupDependencyStore`, which is now saved in Redux, instead of `localStorage`.

It has only two reducers, because these are the only actions that actually happen in `SignupDependencyStore`:

* `SIGNUP_DEPENDENCY_STORE_UPDATE` - update store data with new values
* `SIGNUP_DEPENDENCY_STORE_RESET` - clear out the store

