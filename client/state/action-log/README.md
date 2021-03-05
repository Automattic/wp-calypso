# Action Log

**A Redux [store enhancer](https://github.com/reactjs/redux/blob/HEAD/docs/Glossary.md#store-enhancer)**

The Action Log is a Redux store enhancer which records the most recently dispatched Redux action so
they can be inspected in the development environment for debugging and interactive design.

## Purpose

Like the [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension), the action log
is useful to track and inspect actions flowing through the store.

## Methods

- `actionLog.start()`
  Enable action recording to history. It is enabled by default.

- `actionLog.stop()`
  Disable action recording to history.

- `actionLog.setSize( size )`
  Set the desired action history size. The history will be flushed periodically to prevent unbounded
  growth.

- `actionLog.history`
  Return the current history. The history is an array of action objects.

- `actionLog.filter( query )`
  Return a filtered history of actions matching the query. See [Query](#query).

- `actionLog.watch( query )`
  Watch flow of matching actions real-time in the console. Only the single, most recent watch will
  have effect. See [Query](#query).

- `actionLog.unwatch()`
  Disable action watching.

## Query

The `actionLog.filter( query )` and `actionLog.watch( query )` accept a `query`. The following types
are valid queries which are useful for different situations:

- `string`: `actionLog.filter( "COMMENTS_LIKE" )` - Match actions whose type exactly matches the
  string.

- `RexExp`: `actionLog.filter( /^comments_/i )` - Match actions whose type is matched by the RegExp.

- `PredicateFunction :: action -> bool`:
  `actionLog.filter( action => action.siteId === interestingSiteId)` - A predicate function that
  accepts an action and returns `true` if the action matches.

## Examples

The following examples represent commands and code actually run inside the browser console. These
are not snippets of bundled JavaScript from Calypso.

```js
// return the list of recorded actions
actionLog.history;

// return a subset of the recorded actions filtering on the `action.type`
actionLog.filter( 'COMMENTS_LIKE' );

// Watch actions in the console by string, RegExp or Predicate Function.
// The same types of query arguments may be used with `actionLog.filter`.
actionLog.watch( 'SITE_RECEIVE' );

actionLog.watch( /post/i );

actionLog.watch( ( action ) => action.siteId === myFavoriteSiteId );
```
