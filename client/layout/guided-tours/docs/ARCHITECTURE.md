# Guided Tours: Architecture

## Data: essential and derived state

### Overview

Guided Tours was built with a couple of premises in mind: notably, 1/ that it had to be flexible enough to accommodate all sorts of tours, launching them based on different triggers, and 2/ that we cannot yet know what these triggers will look like. That was the main factor that lead to to our approach, but it was corroborated by other requirements, such as testability and debuggability, minimizing state issues, etc.

Thus [`actionLog`][actionlog] was born. As the name suggests, it consists of a list of Redux actions, each with its own timestamp. These are actions that have been dispatched and whose action type can be found in a specified list of "[relevant types]" — in other words, actions that Guided Tours is interested in for the triggering of tours and the transition of tour steps. By design, `state.ui.actionLog` is never persisted (meaning it starts as an empty list with new each Calypso session) and is limited to the latest 50 collected actions, pushing out older ones.

With `actionLog`, any number of selectors can be written and composed to process the log and derive useful information. For instance, by collecting `ROUTE_SET` actions, and we can obtain the user's recent navigation history; by collecting `FETCH_FOOS_SUCCESS` we can have a tour transition to a new step only when a certain collection of data has been retrieved from the server. Hypothetically, more complex behavioral patterns can be inferred. Imagine the following: a user is entering a Calypso section, then another, then another, all of these in rapid succession, with other actions in between — can we infer that they are unsuccessfully looking for a specific feature? If so, we can offer help contextually.

All of these different ways to leverage the action log constitute \*triggers\*\*. Presently, we have one family of triggers: triggers based on navigation to a specific path. This is what is at play when tour authors define a tour with `<Tour path="/themes">`, for instance.

The last high-level piece to understand is that Guided Tours barely has any explicit state (e.g. "which step of a tour are we in?", "how long is the tour taking to complete?"), instead relying as much as possible on the action log, which includes a dedicated `GUIDED_TOUR_UPDATE` action to signal tour transitions. The result is that, instead of a hypothetical `state.guidedTours.isTourRunning && <Tour />`, we find a cascade of selectors that ultimately compute the state of Guided Tours. This is achievable thanks to a lot of memoization with `createSelector`:

```text
getGuidedTourState
└── findEligibleTour
    ├── findOngoingTour
    └── findTriggeredTour
        └── getToursFromFeaturesReached
```

### The selectors

Circling back to Guided Tours — there is one external selector: `getGuidedTourState`. It essentially wraps around [`findEligibleTour`][findeligibletour], which is where an outline of GT's decision algorithm becomes visible:

```js
export const findEligibleTour = createSelector(
	( state ) => {
		if ( shouldBailAllTours( state ) ) {
			return;
		}

		return (
			findOngoingTour( state ) ||
			( ! shouldBailNewTours( state ) &&
				( findRequestedTour( state ) || findTriggeredTour( state ) ) ) ||
			undefined
		);
	},
	// Though other state selectors are used in `findEligibleTour`'s body,
	// we're intentionally reducing the list of dependants to the following:
	[ getActionLog, getToursHistory ]
);
```

Let's break this down:

- from the last line, the primary sources of information are `actionLog` and the tours "history", which is a user preference in `state.preferences`;
- save for some bailing mechanisms, the decision-making process will favor _ongoing_ tours, then tours that have been explicitly _requested_ (i.e., via query arguments like `?tour=tourName`), then default to tours that can be _triggered_ based on actions that have been tracked in `actionLog`;
- if nothing is found, `undefined` means that no tour is to be selected.

`findOngoingTour` and `findRequestedTour` are the least interesting. `findTriggeredTour` is the extensible selector. As of this writing, this is what it looks like:

```js
const findTriggeredTour = ( state ) => {
	const toursFromTriggers = uniq( [
		...getToursFromFeaturesReached( state ),
		// Right now, only one source from which to derive tours, but we may
		// have more later. Examples:
		// ...getToursFromPurchases( state ),
		// ...getToursFromFirstActions( state ),
	] );

	const toursToDismiss = uniq( [
		// Same idea here.
		...getToursSeen( state ),
	] );

	const newTours = difference( toursFromTriggers, toursToDismiss );
	return find( newTours, ( tour ) => {
		const { when = constant( true ) } = find( relevantFeatures, { tour } );
		return when( state );
	} );
};
```

1. It looks for tours that match the triggers that are in place. Right now, that means `getToursFromFeaturesReached`, which simply a list of tours whose `path` attribute matches the user's recent Calypso navigation history.
2. It eliminates tours that are to be dismissed — right now, that means tours that have already been seen.
3. Of the remainder, it returns the first valid tour. A tour is _valid_ is it has no special `when` attribute or, if it does have it, if `when( state )` evaluates to `true`. `when` offers a dynamic mechanism for tours to set their own starting conditions; it's a selector expected to return a boolean.

## Views

### Structure

At its outermost level, Guided Tours is a single component, **`GuidedTours`**, rendered in Calypso's `Layout`. `GuidedTours` is essentially a wrapper which:

- takes care of the subsystem's data needs (via `connect` and `QueryPreferences`);
- binds Redux action creators for subsequent ease of consumption;
- renders `AllTours` within `RootChild`, as we need our DOM nodes (specifically, a tour's steps) not to be bound to `Layout` or any other specific subtree.

**`AllTours`** is created with **`combineTours`**. It is imported from [`all-tours.js`][all-tours]. Internally, it acts like a switch, only rendering the tour matching the `tourName` prop passed from above.

A _tour_, properly speaking, is stateless, class-based, lifecycle-aware component. However, they are not explicitly built as React components. Instead, they are created by passing an element tree (i.e., plain JSX) to a helper, **`makeTour`**. It was decided early on that the interface for building a tour should be simple and shouldn't place the burden of collecting and passing props on the tour author. Thus, some magic had to be involved. Notably, we need Guided Tours to be aware of two kinds of data:

- static per-tour data: what steps are involved, how they're to be positioned, etc. — this is what tour authors write in plain JSX;
- dynamic Guided Tours state: whether we're in a tour, which step, etc. — this is passed all the way from `GuidedTours`.

To combined these sources, an initial approach was based on `React.cloneElement`; it turned out to present limitations (performance and very interesting bugs due to a broken lifecycle) arising from the fact that cloning happened on every render. The solution was to leverage React's **`context`**. In a nutshell, the `makeTour` helper creates a component which simply renders the plain JSX tree without altering it, but it firstly makes the required dynamic data (state and bound actions) [available through the context][getchildcontext].

Finally, the **plain JSX tour descriptions** are built using a set of [config elements] to create the flow of steps of a tour: `Tour`, `Step`, `Next`, `Continue`, `Quit`. These components are context-aware and have specialized logic that, ultimately, set up the control flow of a tour.

### Positioning

Positioning of tour steps is configurable via `Step`'s `placement` attribute, working in tandem with `target` and `arrow`. Guided Tours' [`positioning`][positioning] library is used, and ultimately a `(x, y)` pair of coords is obtained, converted into a `left/right, top` set of CSS properties to be attached to the tour step's element.

So that step rendering isn't constrained or hindered by Calypso's CSS (such as cases of `overflow: hidden;`), steps are children of `RootChild`, meaning they are not attached to the UI elements they are pointing to (i.e., the steps' targets) but are instead close to the root of the document. This has a number of implications, notably that positioning has to be precisely calcuated to mimick the effect of having steps that are close to their targets; occasionally, z-index differences may need correction; things like scrolling require the positioning logic to know which scrolling container our target is closer to; more importantly, positioning is a somewhat static process that needs to be consciously refreshed whenever applicable – e.g. when scrolling and resizing the window, which are the scenarios GT automatically guards against, but hypothetically anytime the layout changes things can become off. This is typically not an issue when navigating, but it can become problematic in scenarios such as rendering a step on a view where an image that is loading will grow and thus alter the layout.

[config]: https://github.com/Automattic/wp-calypso/blob/HEAD/client/layout/guided-tours/config.js
[getchildcontext]: https://github.com/Automattic/wp-calypso/blob/bc97ba292a5f6213f0cf0c35219472135c4f9b9f/client/layout/guided-tours/config-elements.js#L480
[config elements]: https://github.com/Automattic/wp-calypso/blob/bc97ba292a5f6213f0cf0c35219472135c4f9b9f/client/layout/guided-tours/config-elements.js
[actionlog]: https://github.com/Automattic/wp-calypso/tree/HEAD/client/state/ui/action-log
[relevant types]: https://github.com/Automattic/wp-calypso/blob/b6d0d27438a16cf7c8700cf4ed8b70dbc42805e3/client/state/ui/action-log/reducer.js#L18
[findeligibletour]: https://github.com/Automattic/wp-calypso/blob/b6d0d27438a16cf7c8700cf4ed8b70dbc42805e3/client/state/ui/guided-tours/selectors/index.js#L175
[positioning]: https://github.com/Automattic/wp-calypso/blob/HEAD/client/layout/guided-tours/positioning.js
