# WordPress.com API HTTP Layer

## Summary

WordPress.com API requests require an initial translation from understanding what data pieces of Calypso might be wanting and the endpoints on WordPress.com which can provide that data.
Once that translation has been made the requests have to be sent out over an HTTP connection.
This middleware layer provides a foundation under the API data layer which can be used to pass around pure and stateless descriptions of those desired HTTP requests.
By removing the burden of directly issuing and responding to HTTP requests in the API layer and moving it here, we can more easily accommodate global and centralized policies on those requests, such as batching, dropping, and retrying on failure.

In contrast to a fully-generic HTTP layer this one understands that requests are being made directly to the WordPress.com API and allowances are made in the HTTP Request descriptions to acknowledge this and make working with it a smoother process; for example, authentication is automatically handled.

## Why?

The end-goal for this two-layer middleware approach is to make offline-use first-class in Calypso and to enable things like mobile data management and battery optimization.
However, it also brings about many secondary benefits to the way we build the data gathering and updating bits inside of Calypso.

Let's look at how this system works from a high-level perspective.

## Overview

<!-- the following diagram was generated in draw.io - it can be edited by pasting in the contents of the SVG itself -->

![](https://cldup.com/unQOzvDkjtq/BpewKu.svg)

Wow, that can look confusing!
While this isn't promising to make everything easier, it _is_ promising to make things worth while.
And in fact, with a little bit of exposure it reveals a pattern that ends up simpler and will probably seem easier than "the old way."

### Step A: Component needs to update data

A React component wants to indicate that a given post ought to be marked as liked.
Its API includes two functions for accomplishing this: `likePost( siteId, postId )` and `unlikePost( siteId, postId )`.
It knows nothing about how those two functions work **and it doesn't need to know anything about how they work**, only that they are the names it uses to accomplish its goal.
Because the component interacts with the data layer at this data-centric interface we have the ability to change the implementations for how we interact with synchronizing our data without demanding that the components themselves change.
It calls `likePost` after the user clicks on the like button and that function dispatches a Redux action carrying that intention.

### Step B: API middleware intercepts action

The WordPress.com API middleware understands what it means to like a post.
It knows that when we do so the server needs to be notified so that the like actually persists across browser sessions and API calls.
Further, it knows that it's possible that the server might reject the like, or some other trigger might cause the like to fail.

The middleware speaks with the WordPress.com servers through HTTP requests.
These requests have special properties: they can fail, we might want them to automatically retry upon failure, they can be batched, etc.
Therefore, instead of coding all of this logic into the API middleware itself the middleware will issue another declarative action describing the HTTP request and the meta information and policies about that request.
The new action carries along the information for the request such as the WordPress.com API path and associated query data, an action to dispatch if the request is a success, and an action to dispatch if the request fails. It may also carry an action to call when uploading a file in order to track progress updates through the process.

Because this middleware is merely attempting to keep the server in sync with Calypso's updated state, it needs to pass the action along so that the reducers get the chance to update the app state and reflect the change.

### Step C: HTTP middleware runs actual HTTP request

The HTTP middleware understands what it means to run HTTP requests.
It may take some liberties in how it decides to actually execute the requests; **this liberty is what allows us to provide the global policies like retry behavior, offline behavior, and batching**.

However the middleware decides to do it, it issues the HTTP request.
When either a response comes back in or the request fails, the middleware will dispatch a new follow-up action.
This responder action comes from the original one which triggered the network call (the `HTTP_REQUEST` action) and it will be wrapped with meta information including the response data or error message.
That new action gets re-injected into Redux and will likely be handled by more middleware before it hits the reducers.

In this case, we have assumed that a successful response from the server (a `2xx` status code) means that the like was successful.
This is a wrong assumption, but it is good enough for this discussion.
As seen in the diagram, the API middleware instructed the HTTP middleware to fire a `LIKE_POST` action if the HTTP request succeeds and an `UNLIKE_POST` action if it fails.
This `UNLIKE_POST` action will end up rolling back the first like, which in effect could not be completed because the server failed to update.

### Step D: Reducers see action and update app state

The actual `LIKE_POST` action (and possible the `UNLIKE_POST` as well) hits the reducers and the app state is updated.
This will trigger a re-render on the post component which started the chain and we come full circle.

## Implementation

What essentially is an HTTP request?
What makes it up?
How should it behave?
This implementation provides answers to these questions that we can use to standardize how we make them and deal with them.

> HTTP requests are indications of how we want what's happening in Calypso to change the external world or how we want the external world to change what's happening in Calypso.

They are asynchronous operations which can succeed and which can and do often fail.
They may return with data or error messages from server but they might also return without any data.
They may send data to a server and if it's a lengthy process - an upload - they may issue progress events to indicate how far into the process they currently are.
They are minimally defined by two properties - the HTTP method type (`GET` or `POST`) and the URL path where they should be sent.

Inside of this model we can build a simple interface for issuing and responding to HTTP requests.

### Usage

Use the `http` function to create a Redux action describing an HTTP request.

```js
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

// announce presence - requires no response inside of Calypso
dispatch(
	http( {
		method: 'POST',
		path: '/me/fairly-land/announce-presence',
	} )
);
```

This function accepts an array of parameters for further specifying information about the request.
Please see `state/data-layer/wpcom-http/actions.js` for more information.

Specify one or more of the following properties in an HTTP request in order to respond to the different lifecycle events of the request.

- `onSuccess` dispatched when the request returns with a `2xx` status code
- `onFailure` dispatched when the request fails for any reason whether for an error status code, network timeout, or otherwise
- `onProgress` _if_ issuing a `POST` request _and_ uploading a file then this is dispatched on progress events

Please note that _these are not callback functions_ but rather normal Redux actions which can be serialized and deserialized, inspected and transformed, and monitored or logged.

```js
// get fictional blog updates
// we will ignore failures if they exist
dispatch(
	http( {
		method: 'GET',
		path: `/sites/${ siteId }/fairy-land/updates`,
		onSuccess: { type: ADD_UPDATE, siteId },
	} )
);
```

You may need to know about the original action which triggered the request when the response comes back in.
Notice how we can store that information inside of the responder actions just like how we encapsulate date in closures.

```js
const missileMiddleware = ( store, action ) => {
	if ( FIRE_ZE_MISSILES !== action.type ) {
		return;
	}

	dispatch(
		http( {
			method: 'POST',
			path: '/foe/missile/new',
			onError: { type: TAKE_A_NAP, duration: 5 * MINUTES_IN_SECONDS, nextAction: FIRE_ZE_MISSILES },
		} )
	);
};
```

We can be as creative or dull as we want to be in the request lifecycle.
Because the information from the request response extends the action through meta, we can actually re-use the originating action and handle it based on that meta.

```js
import { getProgress } from 'calypso/state/data-layer/wpcom-http/utils';

const packageMiddleware = ( store, action ) => {
	if ( CREATE_PACKAGE !== action.type ) {
		return;
	}

	const progress = getProgress( action );
	if ( progress ) {
		return dispatch( {
			type: UPDATE_PACKAGE_UPLOAD,
			packageId: action.packageId,
			progress,
		} );
	}

	// reuse the action so we don't need to create
	// additional action types for _PROGRESS etc...
	return dispatch(
		http( {
			method: 'POST',
			path: '/packages/new',
			body: action.FileData,
			onProgress: action,
		} )
	);
};
```

If we decide to reuse the actions it can get tedious to write out the same action every time.
Therefore you can skip the responder actions and pass along the original action as the second and optional parameter to `http()`.

```js
dispatch(
	http(
		{
			method: 'GET',
			path: '/me/splines',
			query: {
				fields: 'ID,tremie_pipe_type',
			},
		},
		action
	)
);
```

If given, the action passed as the second and optional parameter will take the place of all unspecified `onSuccess`, `onFailure`, and `onProgress` responder events.

Because we have a very common pattern when issuing requests there is a built-in helper to hand each action off to the right function based on the (possibly) attached metadata.

```js
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

// create request when no meta present, add on success, alert on failure
dispatchRequest( { fetch: fetchMenu, onSuccess: addMenuItems, onError: alertFailure } );

// create request when no meta present, indicate on success, undo on failure, update on progress
dispatchRequest( {
	fetch: sendRecipe,
	onSuccess: indicateSuccess,
	onError: removeRecipe,
	onProgress: updateRecipeProgress,
} );
```

### `dispatchRequest()` helper

Although there's lot of machinery going on here and possibly many things to keep track of, thankfully we have a helper designed to make it all smooth.
That helper is the `dispatchRequest()` function and it handles all of the networking-related specifics for you so that you can focus on logic designed to issue and respond to network requests.
At its most basic form it implies three actions we need to provide: a function which generates descriptive HTTP requests; a function which handles successful responses; and a function which handles failing responses.
Additionally there are other semantics of network requests it can manage.

- A function to handle progress events during data uploads
- A schema to validate the response data and fail invalid formats
- A way to indicate data "freshness" or how new data must be to fetch it (coming soon!)

Each of these lifecycle functions is in fact an action creator. As arguments, it takes the original
associated action and the data coming from the response. It returns the action we want to be dispatched
when a certain type of API event (request, response, error) happens. If you need to execute more
complex logic in response to an API event, the action creator can return a thunk. Most use cases
just dispatch a single action though, and this case is optimized to require as little code as
possible.

Please note that for this example we have included a progress event even though one would not normally exist for liking posts.
Its inclusion here is meant merely to illustrate how the pieces can fit together.

```js
// API Middleware, Post Like
import { LIKE_POST, LIKE_POST_PROGRESS, UNLIKE_POST } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { QUEUE_REQUEST } from 'calypso/state/data-layer/wpcom-http/constants';

/**
 * @see https://developer.wordpress.com/docs/api/1.1/post/sites/%24site/posts/%24post_ID/likes/new/ API description
 * @param action the action
 */
const likePost = ( action ) =>
	// dispatch intent to issue HTTP request by not supplying onSuccess, onError,
	// and onProgress, but when it comes back it will be wrapped with meta information
	// describing the response from the HTTP events
	// The `dispatchRequest` helper will extend the `http` action with the appropriate
	// `onSuccess` and `onError` handlers. Therefore, you don't need to pass the second `action`
	// argument to the `http` action creator.
	http( {
		method: 'POST',
		path: `/sites/{ action.siteId }/posts/${ action.postId }/likes/new`,

		// indicate what should happen if we have
		// no network connection: queue to replay
		// when the network reconnects
		// (not implemented yet)
		whenOffline: QUEUE_REQUEST,
	} );

/**
 * Called on success from HTTP middleware with `data` parameter
 *
 * This is the place to map fromAPI to Calypso formats
 *
 * @param data
 */
const verifyLike = ( { siteId, postId }, data ) => {
	if ( ! data.hasOwnProperty( 'i_like' ) ) {
		// something went wrong, so failover
		// eslint-disable-next-line no-use-before-define
		return undoLike( { siteId, postId }, 'Invalid data' );
	}

	// this is a response to data coming in from the data layer,
	// so skip further data-layer middleware with local
	return bypassDataLayer( {
		type: data.i_like ? LIKE_POST : UNLIKE_POST,
		siteId,
		postId,
		likeCount: data.like_count,
	} );
};

/**
 * Called on failure from the HTTP middleware with `error` parameter
 *
 * @param error
 */
const undoLike = ( { siteId, postId }, error ) =>
	// skip data-layer middleware
	bypassDataLayer( {
		type: UNLIKE_POST,
		siteId,
		postId,
	} );

/**
 * Maps progress information from the API into a Calypso-native representation
 *
 * @param progress
 */
const updateProgress = ( { siteId, postId }, progress ) => ( {
	type: LIKE_POST_PROGRESS,
	siteId,
	postId,
	percentage: ( 100 * progress.loaded ) / ( progress.total + Number.EPSILON ),
} );

export default {
	// watch for this action
	[ LIKE_POST ]: [
		dispatchRequest( {
			fetch: likePost,
			onSuccess: verifyLike,
			onError: undoLike,
			onProgress: updateProgress,
		} ),
	],
};
```

#### Parsing the response

It's important that perform the mapping stage when handling API request responses to go _from_ the API's native data format _to_ Calypso's native data format.
These middleware functions are the perfect place to perform this mapping because it will leave API-specific code separated into specific places that are relatively easy to find.

See how ugly that validation is though? We can let the data layer do it for us.
Let's create a schema for the response.
The schema doesn't have to match everything in the response.
It's allowed to be a conformal spec where we can ignore anything beyond what we need.

```js
// defines the shape and type of data we can recognize
const likeSchema = {
	id: 'sites-posts-likes-new-response',
	title: 'New Like Response',
	type: 'object',
	$schema: 'http://json-schema.org/draft-04/schema#',
	properties: {
		i_like: {
			type: 'boolean',
		},
	},
	required: [ 'i_like' ],
};

// change the shape of the data and maybe add more information
const toLike = ( { i_like } ) => ( {
	isLiked: i_like,
	lastLiked: Date.now(),
} );

export default {
	[ LIKE_POST ]: [
		dispatchRequest( {
			fetch: likePost, // initiate the request
			onSuccess: verifyLike, // update the Redux store if need be
			onError: undoLike, // remove the like if we failed
			onProgress: updateProgress, // update progress tracking UI
			fromApi: makeJsonSchemaParser( likeSchema, toLike ), // validate and convert to internal Calypso object
		} ),
	],
};
```

Of course, not every response is very complicated or warrants a full-blown parser.
Sometimes we just want to determine the failure or success based off of a simple value in the response.
Let's put this together for a fictitious two-factor authentication process.

```js
const fromApi = ( response ) => {
	if ( ! response.hasOwnProperty( 'auth_granted' ) ) {
		throw new ValueError( 'Could not understand API response' );
	}

	if ( ! response.auth_granted ) {
		throw 'authorization-denied';
	}

	return {
		token: response.auth_token,
		expiresAt: response.auth_valid_until,
	};
};

dispatchRequest( fetch2Auth, approveAuth, announceAppropriateFailureMessage, { fromApi } );
```

In this case we're not only validating the _schema_ of the response data but also the values and deciding
to mark a response as a failure not only when we don't recognize it, but plainly too when the value of the
response indicates that our actual need was a failure. Here we can see that an auth request is a failure
not only if we can't recognize the response, but also if the response indicates that the attempt was a failure.
By incorporating this into the response parser we can keep the logic of Calypso data further separated from
the act of handling network activity.
