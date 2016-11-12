# Console Dispatcher
**A Redux [store enhancer](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#store-enhancer)**

The console dispatcher is a Redux store enhancer which provides access to the Redux store from the developer console when running in a browser environment.
This can be used for debugging and interactive design.
The expected store properties and methods are directly available at the top level as are a few helpers.
These helpers can keep a running history of the Redux actions which fly by for later inspection.

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
// from within the console
// these two are equivalent
getState().ui.selectedSiteId
state.ui.selectedSiteId
```

### Action logging

Like the [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension), the console dispatcher can also track a history of the actions flowing through the store.
This can be toggled and the size of the history log can be adjusted.

The following examples represent commands and code actually run inside the browser console.
These are not snippets of bundles JavaScript inside of Calypso.

```js
// start recording actions
// enabled by default in development
actionLog.start()

// stop recording actions
actionLog.stop()

// set how many actions to track (defaults to 100)
// once enough actions have been recorded in
// the history log, old actions will be flushed
// to make room for the new ones
actionLog.setSize( 1000 )

// return the list of recorded actions
actionLog.history

// return a subset of the recorded actions
// filtering on the `type` parameter
actionLog.filter( 'COMMENTS_LIKE' )

// the action types have also been exported
// to the console for easy access to types
// note that action types will benefit from
// auto-complete in the console
actionLog.filter( actionTypes.COMMENTS_LIKE )
```

