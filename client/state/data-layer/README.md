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

As we started using Redux for our data backend we realized the benefit of describing data mutations over directly mutating that state in memory.
Unfortunately Redux leaves a gap in terms of asynchronous data updates.
`redux-thunk` brought us a way to separate those asynchronous pieces from our components and still live within that Redux ecosystem.

On the bright side, `redux-thunk` solves our needs as they relate to components.
Individual components need only call `this.props.fetchSplines()` if they need a list of splines.
That action creator can live in a more centralized location and is easier to reuse across the application.

Unfortunately this doesn't solve the Redux side of our problems and doesn't give us what we need in terms of flexibility in the data layer to handle other goals such as offline abilities.
It raises another ideological problem: it replaces serializable data structures describing intended changes with non-inspectable function objects.
There is no way of introspecting those thunks as they pass through the Redux middleware and hit the reducers.
Their intentions are opaque.

Further, we are still left in a situation where our data synchronization is decentralized and redundant.
Each thunk action creator must dispatch the API requests and handle the possible network errors which inevitably leads to the same kind of duplication on approximately-equal-while-implemented-slightly-differently functions.

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
Instead the components should be able to request that they require such data and the middleware will intercept the request to fulfill it accordingly.

## Implementation

The data layer _responds to_ Redux actions.
Once it has performed its behavior, the original action will continue along the dispatch path to the next middleware in the chain.
We can create multiple "handler" functions for the same action type and they will be triggered in the order they are registered when that action type dispatches.
The WordPress.com API middleware demonstrates this in building a tree of handlers which can all respond to given data requests.

Each middleware handler can dispatch new follow-up actions to respond in some way to the original action.
For example, they will often dispatch a new HTTP request.
The functions that compose to form the middleware _can_ and in most cases _will_ closely resemble what was previously written in `redux-thunk` actions but in this system they will be controllable.
That is, they are descriptions of what we want to happen which get interpreted by the data layer and possibly altered as it creates a plan to fulfill all the requests.
It's hard to convey how much more useful it is to treat actions and [effects as data](https://www.youtube.com/watch?v=6EdXaWfoslc) rather than actually doing them<sup><a href="http://degoes.net/articles/modern-fp">1</a></sup>.

The middleware should be pieced together from multiple handler functions in a logical way which encourages modularity and isolation of responsibilities.
The data layer provides `mergeHandlers()` as a utility to support this.
**Each file should export an object whose keys are Redux action types to intercept and whose values are lists of functions to invoke on those actions.**
The list of handlers will be called in sequence in the order given in the list itself and in the order in which the different handlers are merged.
Even when there is only one handler the value of the exported key should be a list - a singleton list in this case.

### Handlers

The handlers are functions which take two arguments and whose return value, if any, is ignored.
The type of a handler follows:

```js
// middlewareHandler :: ReduxStore -> ReduxAction -> Any
const myHandler = ( store, action ) => {
	/*...*/
};
```

Note that the Redux store incorporates four methods, two of which are likely to be used here.
When dispatching through the store's `dispatch` function the action will start at the beginning of the entire middleware chain.
Sometimes we need to bypass the data layer so that we don't create endless loops of action dispatches.
In these cases we can import the `bypassDataLayer()` function which will cause the action to do just that: bypass the data layer.

```js
const {
	dispatch, // issues new action dispatches
	getState, // returns the current application state
	replaceReducers, // please oh please don't use here
	subscribe, // attaches event listeners to store updates
} = store;
```

Let's look at a full example:

```js
/**
 * Spline Handler API code
 * state/data-layer/wpcom/splines/index.js
 *
 * Requests splines and reticulations from API
 *
 * Because this uses the HTTP actions it will
 * automatically prevent sending two or more at the
 * same time while we're waiting for a response to
 * come back in and it will also automatically
 * retry if it fails (up to a certain point where
 * it will give up and launch the failure handler)
 */

/**
 * Internal dependencies
 */
import { addSplines } from 'calypso/state/splines/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

/**
 * Transform the API response into consumble data
 *
 * @param data the data
 */
const apiTransformer = ( data ) => data.splines;

/**
 * Issue the HTTP request to fetch the splines
 *
 * @param action the action
 */
const fetchSplines = ( action ) =>
	http(
		{
			method: 'GET',
			apiVersion: 'v1.1',
			path: '/splines',
			query: {
				site_id: action.siteId,
			},
		},
		action
	);

/**
 * Take spline data from API request and inject into state
 *
 * @param action the action
 * @param splines the splines
 */
const handleSuccess = ( action, splines ) => addSplines( action.siteId, splines );

/**
 * Notify customer that we failed to get splines for site
 *
 * TODO: Explain why and provide better alternatives
 */
const announceFailure = () => errorNotice( `Could not retrieve the splines. Please try again.` );

export default {
	[ SPLINES_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchSplines,
			onSuccess: handleSuccess,
			onError: announceFailure,
			fromApi: apiTransformer,
		} ),
	],
};

// middlware.js
const handlers = mergeHandlers( postsEndpoint, sitesEndpoint, splineEndpoint );
```

Note that **these middlewares are not restricted to making HTTP requests**.
A middleware might end up communicating over a `WebSocket`, making `HTTP` requests, reading from a local JSON file, or doing any other operation permitted in JavaScript.
There could be special middleware running on the desktop platform which invokes code which is only possible in the desktop environment, for example, such as saving data to a file on the local computer.

**These also need not handle every possible action type**.
This is a gradual system and can be built to only replace small pieces of the much bigger data synchronization system.
In some cases it might be appropriate for a certain middleware to only handle one type of data; this is fine.

## File Structure

The data middleware is the gateway which performs the mapping between what is natural in Calypso/JavaScript and what is natural on the other side of the data requests.
This is the place to couple files and functions to the structure of the associated system.

For example, the WordPress.com API middleware mirrors the WordPress.com API and its **files should thus mirror the API's structure**. The file which handles requests to the `/sites/[ siteID ]/posts` endpoint should live at `state/data-layer/wpcom/sites/posts/index.js` and the file which handles requests to the `/me` endpoint should live at `state/data-layer/wpcom/me/index.js`.
Each file should be responsible for a single WordPress.com endpoint, and if multiple endpoints need to be polled in response to some Redux action, then we should have one file for each endpoint and both will listen for that same action.

The key principle in this directory is to match the appropriate structures and norms of each possible data provider.
This makes it easier to navigate the code when answering questions like, "where is the code which polls the posts endpoint?"
