`create-selector`
=================

This module exports a single function which creates a memoized state selector for use with the Redux global application state.

## Usage

`createSelector` accepts the following arguments:

- A function which calculates the cached result given a state object and any number of variable arguments necessary to calculate the result
- A function or array of functions which return array of dependent state, given the state and the same arguments as the selector
- _(Optional)_ A function to customize the cache key used by the inner memoized function
- _(Optional)_ A boolean flag to indicate whether or not the caching should bust per individual key (false by default)

For example, we might consider that our state contains post objects, each of which are assigned to a particular site. Retrieving an array of posts for a specific site would require us to filter over all of the known posts. While this would normally be an expensive operation, we can use `createSelector` to create a memoized function:

```js
export const getSitePosts = createSelector(
	( state, siteId ) => state.posts.filter( ( post ) => post.site_ID === siteId ),
	( state ) => [ state.posts ]
);
```

In using the selector, we only need to consider the signature of the first function argument. In this case, we'll need to pass a state object and site ID.

```js
const sitePosts = getSitePosts( state, siteId );
```

This result would only be calculated once, so long as `state.posts` remains the same.

## FAQ

### What is a memoized selector?

We strive to keep redundant data out of our Redux state tree, but this can come at the cost of performance if our selectors are time-consuming in how they evaluate and filter over the minimal state.

A memoized selector can alleviate this concern by storing a cached result, skipping these expensive derivations when we know that the result has already been computed once before from the same state.

### How does a memoized selector know when to recalculate its result?

Because Redux discourages us from mutating state directly, we can be confident that state is only considered to be changed if the segments of the state tree we're concerned with are strictly unequal to a previous state.

When creating a memoized selector via `createSelector`, we pass a function which returns a value or array of values comprising of the parts of the tree we depend upon for our selector.

### Can I pass arguments to my memoized selector?

Yes! This is a very common pattern in our state selectors, and is a key differentiator from [`reselect`](https://github.com/reactjs/reselect), another popular tool which achieves a similar goal.

Do note that the internal memoized function calculates its cache key by a simple [`Array.prototype.join`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join) call, so your arguments should not be complex objects.

### How can I express that my new selector depends on state from multiple selectors?

Let's assume your new selector depends on the state selectors `getFoo`, `getBar`, and `getBaz`. You could then state that like so:

```js
createSelector(
    state => getFoo( state ) && getBar( state ),
    state => [
        getFoo( state ),
        getBar( state ),
        getBaz( state ),
    ]
);
```

Since this is a reoccurring pattern, there is a shorthand for this situation. You can reduce the above to an array just the selectors:

```js
createSelector(
    state => getFoo( state ) && getBar( state ),
    [ foo, bar, baz ]
);
```

### What's the difference between caching per selector or caching per key?

Recall that when a number of arguments are passed to the memoized selector a cache key is generated from those arguments.
Those cache keys are used to store the selected values against.

Normally, when the dependants of that selector change we invalidate the cache for all uses of that selector, regardless of the cache keys.

Take this hypthetical case for example:
```js
const someExpensiveMemoizedSelector = createSelector(
    someExpensiveSelector,
    // here, we're expressing that the selector depends on a particular post in state.
    [ ( state, postId ) => getPost( state, postId ) ]
);

someExpensiveMemoizedSelector( state, '1234' );

// Calling someExpensiveMemoizedSelector with a different Id 
// would clear all previously cached values for someExpensiveMemoizedSelector
someExpensiveMemoizedSelector( state, '1235' );
```

By setting the `cachePerKey` flag to true, the values will be stored in the same way, but will be invalidated on a per key basis.
Subsequent calls to `someExpensiveMemoizedSelector` will only invalidate if the post matching the `postId` changes.

```js
const someExpensiveMemoizedSelector = createSelector(
    someExpensiveSelector,
    // here, we're expressing that the selector depends on a particular post in state.
    [ ( state, postId ) => getPost( state, postId ) ],
    null,
    true // cachePerKey
);

someExpensiveMemoizedSelector( state, '1234' );

// Calling someExpensiveMemoizedSelector with a different Id no longer clears the entire cache.
someExpensiveMemoizedSelector( state, '1235' );
```

### How can I access the internal cache?

While you should rarely need to do so, you can manage the internal Lodash `memoize.Cache` instance on the `memoizedSelector` property of the returned function.
