# Guided Tours: Architecture considerations for the future

As Guided Tours as a framework is made available to parties interested in [writing their own tours](TUTORIAL.md), it seemed pertinent to gather some thoughts and make them available in this document in the hope of reducing any sort of [bus factor](https://en.wikipedia.org/wiki/Bus_factor).


## Lazy loading

In the interest of keeping Calypso's main bundles small and free of pieces that users aren't likely to need, it becomes important that Guided Tours be lazily loaded. Right now, the obvious offenses are:

- All tour configs — comprised of their views and their logic — are systematically loaded, even though in most cases a user will only see 0 or 1 tour in one session.
- Even if no tour is ever triggered, all of the Guided Tours apparatus is loaded, notably a set of components that will never be rendered.
- Even if a tour is indeed to be triggered, it isn't critical that it be showed the very moment Calypso is loaded, and thus the loading of Guided Tours can be deferred.

As of August 2017, Guided Tours impacts Calypso's main bundle `build` as follows:

- `layout/guided-tours`, which includes the view layer and its helpers, as well as individual tour configs: 76 KB stat size, 43 KB parsed, 9 KB gzipped
- `state/ui/action-log`, for which `yarn run analyze-bundles` doesn't provided fine-grained data, but whose raw source, excluding `test`, clocks at 2.5 KB or 1 KB gzipped
- `state/ui/guided-tours`, for which `yarn run analyze-bundles` doesn't provided fine-grained data, but whose raw source, excluding `test`, clocks at 15 KB or 4 KB gzipped

We don't yet support lazy loading of branches of state, and ultimately `state/ui/action-log` has to be gathering information and `state/ui/guided-tours` has to be running selectors to determine if there is a tour to trigger — luckily, it is also the smaller piece.

However, the rest can be lazy-loaded.

### The easy chunk

The first step would be to simply lazily load all of `<GuidedTours />`, the root element rendered in `layout`. Only proper testing of this will reveal what practical gains can be had.

### Finer-grained chunks

`layout/guided-tours` is expected to grow as more tours are added. Ideally, we'd be able to determine whether to trigger a tour and only then load the steps for that tour. The prerequisite for making this happen is that a tour's _triggering conditions_ be available in one chunk — the base chunk of Guided Tours — while the rest of the tour (the steps, which contain their logic for skipping and continuing along with the actual UI fragments) would be available in a smaller separate chunk.

In my mind, there are two ways to achieve this:

- Simply decouple the logic manually by going through every tour config and porting that tour's top-level attributes (`name, version, path, when`) into a common place. Pro: easy enough. Con: requires a change of GT's developer interface.
- Have a Webpack loader programatically group the tours' triggering conditions in a module. Prior art can be found in `server/bundler`, notably [`loader`][bundlerloader], which rewrites `sections.js`. Pro: "magic", doesn't require tour authors to think about chunking and write their configs in separate places. Con: "magic", harder to implement, has the potential to generate confusion.


## State-aware steps

When the day comes that we decide we need proper dynamic, state-aware steps for Guided Tours, [PR #10436][editortourpr] will contain useful material to inform that enhancement; notably, the diff at hand and the last couple of comments before the closing of the pull request. In a nutshell:

```js
// default behavior would be unaffected
<Step name="…" when={ isSomethingSomething } …>
  <p>Welcome!</p>
  …
</Step>

// new "realtime" state-based behavior
<Step name="…" …>
  { ( state ) => isSomethingSomething( state ) &&
    <p>Welcome!</p> }
</Step>
```

## On the nature of `actionLog`

`actionLog`<sup>[1](#note-1)</sup> is a collection of actions — another name for events — that grows: 1) over time, and 2) in only one direction. It is thus, by nature, equivalent to a **stream**, even though that concept is AFAIK never used in Calypso.

Most (if not all) of the ways `actionLog` is processed — with `map`, `filter`, `reduce`, `find` — have their stream-centric counterparts. This is very important to be aware of, since any suite for stream manipulation, such as [RxJS][rxjs], will excel at those manipulations and optimize them far more than we could with our basic caching and heuristics.

## Making `actionLog` scale

By design, `actionLog`'s reducer will react to all sorts of actions coming in through the dispatcher. As of this writing, the [list][relevanttypes] of subscribed types is relatively limited:

```
FIRST_VIEW_HIDE
GUIDED_TOUR_UPDATE
THEMES_RECEIVE
PREVIEW_IS_SHOWING
ROUTE_SET
SITE_SETTINGS_RECEIVE
```

Yet, a few things are clear:

- As more Guided Tours are built in the future, that list can only grow.
- There are really no limits to _what kind_ of actions may be added to it — from navigation, to success signals of fetches, to specific signals of user interaction.
- A non-negligible part of these actions can be fired very often (_e.g._, `ROUTE_SET`).

Every time `actionLog` changes, Guided Tours's main selectors get called with the new state, whether a tour is running or not. This has obvious **performance implications**. Right now, we believe this is acceptably mitigated by 1) copious use of memoization with `createSelector` and simple cache heuristics, and 2) the still limited set of action types `actionLog` subscribes to.

Nevertheless, whenever the selectors have to be fully reevaluated, all of `actionLog` has to be considered anew: all those sub-selectors will perform multiple `map`s, `reduce`s, etc. on the latest `actionLog`, even though most of its items have already been mapped, reduced, etc. in previous versions of `actionLog`.

Premature optimization is generally considered harmful, and for this we haven't optimized yet. But this document seeks to gather thoughts for the day when, through meticulous profiling (best-case scenario) or out of desperate hunches (worst-), we decide optimization is needed. Next comes a collection of ideas on how to address the issue, some of them composable, some mutually incompatible.

### Streams!

You probably saw this one coming. Calypso does not use [streams][rxjs], but, should we decide in favor of them, an improved `actionLog` would be had at minimum cost: as mentioned in _§ On the nature of `actionLog`_, the RxJS operators would naturally be adequate and optimized to handle `actionLog`. Realistically, though, adopting RxJS is much more than just pulling a large library (compressed/uncompressed: 30.1/138 KB), it's adopting a whole new programming paradigm. As much as I'd like to see that happen, it probably won't anytime soon.

### (Persistent?) Data Structures

The following approach, leveraging persistent or linked data structures, could be a simple replacement for streams. It aims to replace standard array traversal functions with a suite of functions optimized for `actionLog`: `mapActionLog`, `filterActionLog`, etc. Since `actionLog` is a [monoid][monoids], any operation _f_ on `actionLog` can be decomposable to [divide and conquer][divideconquer]. Notably,

```js
f( [ A, B, C ] ) === join( f( [ A, B ] ), f( [ C ] ) )
```

where `join` is a specific function for `f`.

Now, since selectors are run for each new version of `actionLog`, it is expected that, by the time we need to eval `f( [ A, B, C ] )`, we've already eval'd `f( [ A, B ] )`, meaning we can benefit from memoization:

```js
f( [ A, B, C ] ) === join( cached, f( [ C ] ) )
```

thus avoiding a traversal of the entire `actionLog`.

Let's look at the basic functions we use for traversal and how they can be decomposed, starting from the easiest:

```js
get( [ A, B, C ] ) === join( get( [ A, B ] ), get( [ C ] ) )
join = ( a, b ) => a.concat( b )
```

```js
map( [ A, B, C ] ) === join( map( [ A, B ] ), map( [ C ] ) )
join = ( a, b ) => a.concat( b )
```

```js
filter( [ A, B, C ] ) === join( filter( [ A, B ] ), filter( [ C ] ) )
join = ( a, b ) => a.concat( b )
```

```js
find( [ A, B, C ], f ) === join( find( [ A, B ], f ), find( [ C ], f ) )
join = ( a, b ) => a || b
```

```js
reduce( [ A, B, C ], f, initial ) === reduce(
	[ C ],
	f,
	reduce( [ A, B ], f, initial )
) // simpler to express without `join`, unless we had lazy eval
```

**A sad caveat.** JS collections are implemented with arrays and not [linked lists][linkedlists], meaning we have no built-in way to express a collection in terms of its _head_ (new item) + _tail_ (the rest, _i.e._ the "previous version" of the list). Implementing the above suite in a way that would allows us to benefit from caching (the whole point of this!) would require also implementing `actionLog` as a basic [doubly linked list][doublylinked], be it homemade or with a library. It shouldn't be hard, but it's disappointing.


### A deep map of actions

The last potential approach would be to completely replace `actionLog` with a deep structure that condenses different kinds of data. The best way to explain myself is to provide examples:

- Instead of collecting `ROUTE_SET`, a branch of the structure would look like:

```js
navigation: {
	lastSection: 'theme',
	lastPath: '/theme/twentysixteen',
	history: [ … ]
}
```

- Instead of collecting `THEMES_RECEIVE` or `SITE_SETTINGS_RECEIVE`, a branch of the structure would look like:

```js
requests: {
	themes: {
		timestamp: 123456789 // last update
	},
	sites: { … }
}
```

- Instead of collecting `GUIDED_TOUR_UPDATE`, a branch of the structure would look like:

```js
guidedTours: {
	lastState: { … }
}
```

The major benefits of this approach are:

- Guided Tours-related selectors have much finer-grained control for the caching heuristic (_e.g._ `state => [ state.ui.actionMap.requests.themes ]` vs. a very broad `state => [ state.ui.actionLog ]`)
- Selectors will generally need to traverse large collections much more rarely, though they could still be had within `actionMap`.

In short, the **pro** would be that, _if_ the solution turned out to be robust enough for all the scenarios that Guided Tours developers can throw at it, it would likely be _very_ fast (much less work happening in selector calls).

The **con** is that it's less flexible than a system — like `actionLog` — that merely logs all essential state and doesn't prematurely derive it. `actionLog` was [chosen specifically][architecture] because of how little committed that solution is and because of how all sorts of selectors can peacefully consume the log without conflicting with one another. A deep structure would require some planning of how and where to store pieces of data. The last minor con is that some of the computation taken away from the selector calls would be offloaded to the reducer calls.

### Different kinds of "relevant" action types

This is a small potential enhancement to `actionLog` that, contrary to the other proposals, doesn't require a major overhaul. Currently, `actionLog` blindly collects any action matching `relevantTypes` into one single array. The approach here would be to split this into two different arrays within that structure: `relevantTourEntryTypes` and `relevantTourAdvancementTypes`:

- `relevantTourEntryTypes` action types that, given the existing tours in Calypso, are capable of triggering a new tour.
- `relevantTourAdvancementTypes`: action types that are not used to trigger new tours, but merely to advance an _ongoing_ tour from one step to the next.

With this distinction, assuming we could keep `relevantTourEntryTypes` small, many more selector calls could be skipped when we know that no tour is ongoing.

* * *

<a name="note-1"><sup>1</sup></a>: Having read and understood the [architecture] is a prerequisite.

[bundlerloader]: https://github.com/Automattic/wp-calypso/blob/8d81eb6e9e58e2de221fb9582d6fec81241d2e4c/server/bundler/loader.js
[editortourpr]: https://github.com/Automattic/wp-calypso/pull/10436#issuecomment-273854187
[architecture]: ./ARCHITECTURE.md
[relevanttypes]: https://github.com/Automattic/wp-calypso/blob/25cdc9141129757530c66b3b2525c9fd3a0aebb8/client/state/ui/action-log/reducer.js#L19-L27
[rxjs]: https://github.com/ReactiveX/rxjs
[monoids]: http://learnyouahaskell.com/functors-applicative-functors-and-monoids#monoids
[divideconquer]: https://en.wikipedia.org/wiki/Divide_and_conquer_algorithm
[linkedlists]: https://en.wikipedia.org/wiki/Linked_list
[doublylinked]: https://en.wikipedia.org/wiki/Doubly_linked_list
