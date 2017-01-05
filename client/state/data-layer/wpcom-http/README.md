# WordPress.com API HTTP Layer

## Summary

WordPress.com API requests require an initial translation from understanding what data pieces of Calypso might be wanting and the endpoints on WordPress.com which can provide that data.
Once that translation has been made the requests have to be sent out over an HTTP connection.
This middleware layer provides a foundation under the API data layer which can be used to pass around pure and stateless descriptions of those desired HTTP requests.
By removing the burden of directly issuing and responding to HTTP requests in the API layer and moving it here, we can more easily accommodate global and centralized policies on those requests, such as batching, dropping, and retrying on failure.

In contrast to a fully-generic HTTP layer this one understands that requests are being made directly to the WordPress.com API and allowances are made in the HTTP Request descriptions to acknowledge this and make working with it a smoother process; for example, authentication is automatically handled.

## Why?

The end-goal for this two-layer middleware approach is to make offline-use first-class in Calypso and to enable things like mobile data management and battery optimization.

Let's look at how this system works from a high-level perspective.

## Overview

<!-- the following diagram was generated in draw.io - it can be edited by pasting in the contents of the SVG itself -->
![](https://cldup.com/unQOzvDkjtq/vSrA37.svg)

Wow, how confusing!
Well, this isn't promising to make everything easier, but it _is_ promising to make things worth while.

### Step A: Component needs to update data

A React component wants to indicate that a given post ought to be marked as liked.
It's API includes two functions for accomplishing this: `likePost( siteId, postId )` and `unlikePost( siteId, postId )`.
It knows nothing about how those two functions work, only that they are the names it uses to accomplish its goal.
It calls `likePost` after the user clicks on the like button.

### Step B: API middleware intercepts action

The WordPress.com API middleware understands what it means to like a post.
It knows that when we do so, the server needs to also be notified so that the like actually persists.
Further, it knows that it's possible that the server might reject the like, or some other trigger might cause the like to fail.

The middleware speaks with the WordPress.com servers through HTTP requests.
These requests have special properties: they can fail, we might want them to automatically retry upon failure, they can be batched, etc.
Therefore, instead of coding all of this logic into the API middleware itself the middleware will issue another declarative action describing the HTTP request and the meta information and policies about that request.
The new action carries along the information for the request such as the WordPress.com API path and associated query data, an action to dispatch if the request is a success, and an action to dispatch if the request fails.

Because this middleware is merely attempting to keep the server in sync with Calypso's updated state, it needs to pass the action along so that the reducers get the chance to update the app state and reflect the change.

### Step C: HTTP middleware runs actual HTTP request

The HTTP middleware understands what it means to run HTTP requests.
It may take some liberties in how it decides to actually execute the requests.
This liberty is what allows us to provide the global policies like retry behavior, offline behavior, and batching.

In whatever means it decides fitting, the middleware issues the HTTP request.
When either a response comes back in or the request fails, the middleware will dispatch a new follow-up action.
This action comes from the original HTTP Request action but it will be wrapped with meta information including the response data or error message.
That action gets reinjected into Redux and will presumably be handled by more middleware.

In this case, we have assumed that a successful response from the server means that the like when through.
This is a wrong assumption, but it is good enough for this discussion.
As seen in the diagram, the API middleware instructed the HTTP middleware to fire a `LIKE_POST` action if the HTTP request succeeds and an `UNLIKE_POST` action if it fails.
This `UNLIKE_POST` action will end up rolling back the first like, which in effect could not be completed because the server failed to update.


### Step D: Reducers see action and update app state

The actual `LIKE_POST` action (and possible the `UNLIKE_POST` as well) hit the reducers and the app state is updated.
This will trigger a re-render on the post component which started the chain and we come full circle.

## Implementation

If you would like to take advantage of this system you will want to use the provided helper methods and structure your code into three pieces: a function which generates the descriptive HTTP requests; a function which handles successful responses; and a function which handles failing responses.

Each of these functions will take the normal middleware arguments but the success and failure functions take an additional argument which is the response data or error respectively.

```js
// API Middleware, Post Like
import { LIKE_POST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { QUEUE_REQUEST } from 'state/data-layer/wpcom-http/constants';

/**
 * @see https://developer.wordpress.com/docs/api/1.1/post/sites/%24site/posts/%24post_ID/likes/new/ API description
 */
const likePost = ( { dispatch }, action, next ) => {
	// dispatch intent to issue HTTP request
	dispatch( http( {
		method: 'POST',
		path: '/sites/%s/posts/%d/likes/new',
		pathArgs: [ action.siteId, action.postId ],
		
		// we can reuse the original action because
		// we will use meta to indicate which part
		// of the process we are in
		onSuccess: action,
		onFailure: action,
		
		// indicate what should happen if we have
		// no network connection: queue to replay
		// when the network reconnects
		// (not implemented yet)
		whenOffline: QUEUE_REQUEST,
	} ) );
	
	// feed LIKE_POST action along to reducers
	// and skip additional data-layer middleware
	next( action );
}

/**
 * Called on success from HTTP middleware with `data` parameter
 *
 * This is the place to map fromAPI to Calypso formats
 */
const verifyLike = ( { dispatch }, { siteId, postId }, next, data ) => {
	// this is a response to data coming in from the data layer,
	// so skip further data-layer middleware with next vs. dispatch
	next( {
		type: data.i_like ? LIKE_POST : UNLIKE_POST,
		siteId,
		postId,
		likeCount: data.like_count,
	} );
}

/**
 * Called on failure from the HTTP middleware with `error` parameter
 */
const undoLike = ( { dispatch }, { siteId, postId }, next, error ) => {
	// skip data-layer middleware
	next( {
		type: UNLIKE_POST,
		siteId,
		postId,
	} );
}

export default {
	// watch for this action       -> initiate, onSuccess,  onFailure
	[ LIKE_POST ]: [ dispatchRequest( likePost, verifyLike, undoLike ) ]
};
```
