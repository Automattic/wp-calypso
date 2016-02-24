/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';

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
			return Object.assign( {}, state, keyBy( action.posts, 'global_ID' ) );
		case SERIALIZE:
			return {};
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
 * The state reflects a mapping of serialized query key to query status.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queries( state = {}, action ) {
	switch ( action.type ) {
		case POSTS_REQUEST:
		case POSTS_REQUEST_SUCCESS:
		case POSTS_REQUEST_FAILURE:
			const { type, siteId, posts } = action;
			const serializedQuery = getSerializedPostsQuery( action.query, siteId );

			state = Object.assign( {}, state, {
				[ serializedQuery ]: Object.assign( {}, state[ serializedQuery ], {
					// Only the initial request should be tracked as fetching.
					// Success or failure types imply that fetching has completed.
					fetching: ( POSTS_REQUEST === type )
				} )
			} );

			// When a request succeeds, map the received posts to state.
			if ( POSTS_REQUEST_SUCCESS === type ) {
				state[ serializedQuery ].posts = posts.map( ( post ) => post.global_ID );
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
 * dispatched. The state reflects a mapping of serialized query to last known
 * page number.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queriesLastPage( state = {}, action ) {
	switch ( action.type ) {
		case POSTS_REQUEST_SUCCESS:
			const { siteId, found } = action;
			const serializedQuery = getSerializedPostsQueryWithoutPage( action.query, siteId );
			const lastPage = Math.ceil( found / ( action.query.number || DEFAULT_POST_QUERY.number ) );

			return Object.assign( {}, state, {
				[ serializedQuery ]: Math.max( lastPage, 1 )
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	items,
	siteRequests,
	queries,
	queriesLastPage
} );
