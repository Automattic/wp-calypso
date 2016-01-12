/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import indexBy from 'lodash/collection/indexBy';

/**
 * Internal dependencies
 */
import {
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_SUCCESS,
	POSTS_REQUEST_FAILURE
} from 'state/action-types';

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
			state = Object.assign( {}, state, indexBy( action.posts, 'global_ID' ) );
			break;
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
			break;
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
			const query = JSON.stringify( action.query );

			// Clone state and ensure that site is tracked
			state = Object.assign( {}, state );
			if ( ! state[ siteId ] ) {
				state[ siteId ] = {};
			}

			// Only the initial request should be tracked as fetching. Success
			// or failure types imply that fetching has completed.
			state[ siteId ][ query ] = {
				fetching: POSTS_REQUEST === type
			};

			// When a request succeeds, map the received posts to state.
			if ( POSTS_REQUEST_SUCCESS === type ) {
				state[ siteId ][ query ].posts = posts.map( ( post ) => post.global_ID );
			}
			break;
	}

	return state;
}

export default combineReducers( {
	items,
	sitePosts,
	siteQueries
} );
