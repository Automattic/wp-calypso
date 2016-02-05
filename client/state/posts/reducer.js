/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import indexBy from 'lodash/collection/indexBy';

/**
 * Internal dependencies
 */
import {
	POST_REQUEST,
	POST_REQUEST_SUCCESS,
	POST_REQUEST_FAILURE,
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_SUCCESS,
	POSTS_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	getSerializedPostsQuery,
	getSerializedPostsQueryWithoutPage
} from './utils';
import { DEFAULT_POST_QUERY } from './constants';

/**
 * Tracks all known post objects, indexed by post global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case POSTS_RECEIVE:
			return Object.assign( {}, state, indexBy( action.posts, 'global_ID' ) );
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return {};
	}
	return state;
}

/**
 * Returns the updated site posts state after an action has been dispatched.
 * The state reflects a mapping of site ID, post ID pairing to global post ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function sitePosts( state = {}, action ) {
	switch ( action.type ) {
		case POSTS_RECEIVE:
			state = Object.assign( {}, state );
			action.posts.forEach( ( post ) => {
				if ( ! state[ post.site_ID ] ) {
					state[ post.site_ID ] = {};
				}

				state[ post.site_ID ][ post.ID ] = post.global_ID;
			} );
			return state;
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

/**
 * Returns the updated site post requests state after an action has been
 * dispatched. The state reflects a mapping of site ID, post ID pairing to a
 * boolean reflecting whether a request for the post is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function siteRequests( state = {}, action ) {
	switch ( action.type ) {
		case POST_REQUEST:
		case POST_REQUEST_SUCCESS:
		case POST_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, state[ action.siteId ], {
					[ action.postId ]: POST_REQUEST === action.type
				} )
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated post query state after an action has been dispatched.
 * The state reflects a mapping of site ID to active queries.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function siteQueries( state = {}, action ) {
	switch ( action.type ) {
		case POSTS_REQUEST:
		case POSTS_REQUEST_SUCCESS:
		case POSTS_REQUEST_FAILURE:
			const { type, siteId, posts } = action;
			const query = getSerializedPostsQuery( action.query );

			state = Object.assign( {}, state, {
				[ siteId ]: Object.assign( {}, state[ siteId ] )
			} );

			state[ siteId ][ query ] = Object.assign( {}, state[ siteId ][ query ], {
				// Only the initial request should be tracked as fetching.
				// Success or failure types imply that fetching has completed.
				fetching: ( POSTS_REQUEST === type )
			} );

			// When a request succeeds, map the received posts to state.
			if ( POSTS_REQUEST_SUCCESS === type ) {
				state[ siteId ][ query ].posts = posts.map( ( post ) => post.global_ID );
			}

			return state;

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

/**
 * Returns the updated post query last page state after an action has been
 * dispatched. The state reflects a mapping of site ID to last page for a posts
 * query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function siteQueriesLastPage( state = {}, action ) {
	switch ( action.type ) {
		case POSTS_REQUEST_SUCCESS:
			const { siteId, found } = action;

			state = Object.assign( {}, state, {
				[ siteId ]: Object.assign( {}, state[ siteId ] )
			} );

			const serializedQuery = getSerializedPostsQueryWithoutPage( action.query );
			const lastPage = Math.ceil( found / ( action.query.number || DEFAULT_POST_QUERY.number ) );
			state[ siteId ][ serializedQuery ] = Math.max( lastPage, 1 );
			return state;

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	items,
	sitePosts,
	siteRequests,
	siteQueries,
	siteQueriesLastPage
} );
