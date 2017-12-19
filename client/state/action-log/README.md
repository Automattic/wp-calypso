# Action Logger
**A Redux [store enhancer](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#store-enhancer)**

The Action Logger is a Redux store enhancer which records the most recently dispatched redux action
so they can be inspected in the development environment for debugging and interactive design.

## Functionality

### Action logging

Like the [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension), the action
logger can track a history of the actions flowing through the store.  This can be toggled and the
size of the history log can be adjusted.

The following examples represent commands and code actually run inside the browser console.
These are not snippets of bundled JavaScript from Calypso.

```js
// start recording actions
// enabled by default in the development environment
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
```

