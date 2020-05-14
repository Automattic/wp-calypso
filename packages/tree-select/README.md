# Tree select

This module exports a function which creates a cached state selector for use with the Redux global application state. It is a good idea to use this function over plain selectors whenever either the computation over state or React's rerenders are expensive.
It is called `treeSelect` because it internally uses a tree of dependencies to allow the gc to free memory without explicitly clearing the cache.

## Usage

`treeSelect` accepts the following arguments:

- **getDependents**: A function which maps over `state` and returns all of the relevant parts of state the selector needs. You should be creating an array whose elements are all return values of other selectors -- no computations allowed here.
- **selector**: A function which takes in the same args as `getDependents` with one catch. Instead of being passed state as its first arg, it is given the results of getDependents. This forces you to declare all of your state-dependencies.

For example, imagine that our state contains post objects, each of which are assigned to a particular site. Retrieving an array of posts for a specific site would require us to filter over all of the known posts. While this would normally trigger a re-render in React, we can use `treeSelect` to create a cached version of the selector which can return a referentially equal object:

```js
const getDependents = ( state ) => [ state.posts ];
const selector = ( [ posts ], siteId ) => filter( posts, { siteId } );

const getSitePosts = treeSelect( selector, getDependents );
```

In using the selector, we pass in the arguments for `selector`. In this case, we'll need to pass a state object and siteId.

```js
const sitePosts = getSitePosts( state, siteId );
```

This result would only be calculated once, so long as `state.posts` remains the same.

## FAQ

### What is a cached selector?

We strive to keep redundant data out of our Redux state tree, but this can come at the cost of performance if our selectors are time-consuming in how they evaluate and filter over the state.

A cached selector is to redux state what a [materialized view](https://en.wikipedia.org/wiki/Materialized_view) is to a database table. It is a selector that caches results as long as its dependent parts of state have not changed.

### How does the cached selector know when to recalculate its result?

Because Redux discourages us from mutating objects within state directly, we only need to verify that a piece of state is no longer referentially equal to its previous state (as opposed to a deep equality check).

When creating a treeSelect selector, you give it a function `getDependents` that returns an array of dependents. As an example, lets say you have a function that depends on both a particular site and its comments like so:

```js
const getDependents = ( state, siteId ) => [ state.comments[ siteId ], state.sites[ siteId ] ];
const selector = ( [ comments, site ], siteId ) =>
	`Site ${ site.title } has ${ comments.length } comments`;

const cachedSelector = treeSelect( selector, getDependents );
```

internally, the selector will store a dependency tree of dependents where the last node is a map keyed by a run of `...args.join()`. The tree would look like:

```
                    comments
                       +
                       |
            +--------------------+
            |                    |
            v                    v
          site1                site2
            +                    +
      +------                   ...
      v
  "siteId1"
      +
      |
      v
    "Site...."
```
