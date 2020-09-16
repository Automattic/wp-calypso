# Console Dispatcher

**A Redux [store enhancer](https://github.com/reactjs/redux/blob/HEAD/docs/Glossary.md#store-enhancer)**

The console dispatcher is a Redux store enhancer which provides access to the Redux store from the developer console when running in a browser environment.
This can be used for debugging and interactive design.
The expected store properties and methods are directly available at the top level.
Additionally, [`actionTypes`](/client/state/action-types.js) are available at the top level.

## Functionality

### Redux methods

The four primary methods that Redux stores provide are all available at the root level.

- `dispatch()`
- `getState()`
- `replaceReducer()`
- `subscribe()`

An alias to `getState()` has been provided for terseness in the console: `state`.
`state` is a defined property with a getter which calls `getState()` and thus can be directly substituted.

```js
// these two are equivalent from within the console
getState().ui.selectedSiteId;
state.ui.selectedSiteId;

// dispatch an action
// actionTypes are available on the console
dispatch( { type: actionTypes.USER_SETTINGS_REQUEST } );
```
