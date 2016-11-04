# Calypso Data Layer

## Background

React provides a great abstraction for developers to create "declarative views" over given data.
Redux provides a "predictable state container" that makes for a great backend for the data React renders.
Both of these libraries have been successful at simplifying applications leading to fewer bugs and (arguably) more consistency in code.
One major part of an application that both libraries are silent on is the problem of fetching and updating data remotely/asynchronously.
Many existing solutions bring different trade-offs for completing this goal.
This data layer is designed choose the appropriate trade-offs for Calypso: **a central and global data subsystem which allows Calypso to be abstracted on the data and formats that it expects while trusting that the platform will make the appropriate format translation and synchronization that is needed.**

### Direct API requests within component lifecycle methods

The most straightforward and naïve approach to remote data is to make API calls directly inside a component's lifecycle methods (such as `componentDidMount`) and store the results in local component state.

On the bright side, anyone reading the component knows exactly what it's fetching and updating and can see at a glance how that maps to the view.

Unfortunately this can lead to massive data duplication and performance degradation (multiple components will end up requesting the same data), out-of-sync errors (this component updates an object but leaves other components with old and stale data), implementation errors (component isn't updated when API changes), and untestable components (tests require plenty of mocking and setup because of the stateful API calls).

Having lots of distributed data fetching means that we will end up with many functions dealing with data that all do approximately the same thing but they will do so in many different ways.
It's a hard mess to contain and keep tidy and adds dramatic burden to maintaining those components.

### redux-thunk

As we started using Redux for our data backend we realized the benefit of describing data mutations over direct mutation.
Unfortunately Redux leaves a gap in terms of asynchronous data updates.
`redux-thunk` brought us a way to separate those asynchronous pieces from our components and live within the Redux ecosystem.

On the bright side, `redux-thunk` solves our needs as they relate to components.
Individual components need only call `this.props.fetchSplines()` if they need a list of splines.
That action creator can live in a more centralized location and is easier to reuse across the application.

Unfortunately this doesn't solve the Redux side of our problems and doesn't give us what we need in terms of flexibility in the data layer to handle other goals such as offline abilities.
It raises another ideological problem: it replaces serializable data structures describing intended changes with non-inspectable function objects.
There is no way of introspecting those thunks as they pass through the Redux middleware and hit the reducers.
Their intentions are opaque.

Further, we are still left in a situation where our data synchronization is decentralized and redundant.
Each thunk action creator must dispatch the API requests and handle the possible network errors, which inevitably leads to the same kind of duplication on approximately-equal-while-implemented-slightly-differently functions.

## Goals and characteristics

This data layer opens up our ability to make Calypso perform well offline, lessens the burden of keeping related data in sync, and provides mechanisms to reduce mobile battery consumption and minimize network bandwidth.

Components should be thinking of _what_ their data needs are more than they should be thinking about _how_ to meet them.
They should _trust_ the framework to make sure those needs are met if indeed it is possible to meet them.

In contrast to the prior solutions the Redux actions which components will end up dispatching do not directly invoke the associated API calls and asynchronous fetches.
Middleware at this layer will trap those actions and interpret them however is most fitting.
For example, it may determine that an update to one type of data justifies also updating another related type of data at the same time.
It may determine that some actions, such as submitting a post or comment, justify waiting a short period of time before actually requesting an update on the server to allow for cancelling accidental submissions.

This middleware should break the tight coupling between Calypso's internal data structure and that presented by the APIs or backends which supply it.
Components should ideally not need to know that some parts of related data (such as a site's settings or plan subscriptions) comes from distinct API endpoints.
Instead the components should be able to request that they require such data the the middleware will intercept the request to fulfill it accordingly.

## Implementation

The data layer _intercepts_ Redux actions.
Once it does this the action will be dropped entirely.
This is to prevent two middlewares which can both supply a given request from fighting with each other or duplicating the request; consequently it allows for prioritization of data-fetching needs by means of ordering how the middleware are arranged in the chain.

Each middleware intercepts given Redux actions and will correspondingly dispatch new follow-up actions to actually handle their requests.
The functions that compose to form the middleware _can_ and in most cases _will_ closely resemble what was previously written in `redux-thunk` actions.

The middleware should be pieced together from multiple handler functions in a logical way which encourages modularity and isolation of responsibilities.
The data layer provides `mergeHandlers()` as a utility to support this.
**Each file should export an object whose keys are Redux action types to intercept and whose values are lists of functions to invoke on those actions.**
The list of handlers will be called in sequence in the order given in the list itself and in the order in which the different handlers are merged.
Even when there is only one handler the value of the exported key should be a list - a singleton list in this case.

```js
const requestSplines = ( { dispatch }, action ) => {
	…
};

const invalidateExisting = ( { dispatch } ) => {
	…
};

const requestReticulations = ( store, { splineSet } ) =>
	requestSplines( store, { type: REQUEST_SPLINES, setId: splineSet } );

export default {
	[ REQUEST_RETICULATIONS ]: [ requestReticulations ],
	[ REQUEST_SPLINES ]: [ invalidateExisting, requestSplines ],
}

// middlware.js
const handlers = mergeHandlers(
	postsEndpoint,
	sitesEndpoint,
	splineEndpoint,
);
```

Note that **these middlewares are not restricted to making HTTP requests**.
A middleware might end up communicating over a `WebSocket`, making `HTTP` requests, reading from a local JSON file, or doing any other operation permitted in JavaScript.
There could be special middleware running on the desktop platform which invokes code which is only possible in the desktop environment, for example.

**These also need not handle every possible action type**.
This system is incremental and can replace pieces of the data synchronization system.
In some cases it might be appropriate for a certain middleware to only handle one type of data; this is fine.
