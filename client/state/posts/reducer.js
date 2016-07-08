/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import get from 'lodash/get';
import set from 'lodash/set';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';
import isEqual from 'lodash/isEqual';
import reduce from 'lodash/reduce';
import keyBy from 'lodash/keyBy';
import groupBy from 'lodash/groupBy';
import merge from 'lodash/merge';
import findKey from 'lodash/findKey';

/**
 * Internal dependencies
 */
import PostQueryManager from 'lib/query-manager/post';
import {
	POST_DELETE,
	POST_EDIT,
	POST_EDITS_RESET,
	POST_REQUEST,
	POST_REQUEST_SUCCESS,
	POST_REQUEST_FAILURE,
	POST_RESTORE,
	POST_RESTORE_FAILURE,
	POST_SAVE,
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_SUCCESS,
	POSTS_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import counts from './counts/reducer';
import { getSerializedPostsQuery } from './utils';
import { itemsSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

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

		case POST_DELETE:
			const globalId = findKey( state, {
				ID: action.postId,
				site_ID: action.siteId
			} );

			if ( ! globalId ) {
				break;
			}

			return omit( state, globalId );

		case SERIALIZE:
			return state;

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, itemsSchema ) ) {
				return state;
			}

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
 * Returns the updated post query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queryRequests( state = {}, action ) {
	switch ( action.type ) {
		case POSTS_REQUEST:
		case POSTS_REQUEST_SUCCESS:
		case POSTS_REQUEST_FAILURE:
			const serializedQuery = getSerializedPostsQuery( action.query, action.siteId );
			return Object.assign( {}, state, {
				[ serializedQuery ]: POSTS_REQUEST === action.type
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated post query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of post
 * global IDs for the query, if a query response was successfully received.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queries( state = {}, action ) {
	switch ( action.type ) {
		case POST_RESTORE: {
			const { siteId, postId } = action;
			if ( ! state[ siteId ] ) {
				return state;
			}

			const nextManager = state[ siteId ].receive( {
				ID: postId,
				status: '__RESTORE_PENDING'
			}, { patch: true } );

			if ( nextManager === state[ siteId ] ) {
				return state;
			}

			return Object.assign( {}, state, {
				[ siteId ]: nextManager
			} );
		}

		case POST_RESTORE_FAILURE: {
			const { siteId, postId } = action;
			if ( ! state[ siteId ] ) {
				return state;
			}

			const nextManager = state[ siteId ].receive( {
				ID: postId,
				status: 'trash'
			}, { patch: true } );

			if ( nextManager === state[ siteId ] ) {
				return state;
			}

			return Object.assign( {}, state, {
				[ siteId ]: nextManager
			} );
		}

		case POSTS_REQUEST_SUCCESS: {
			const { siteId, query, posts, found } = action;
			const manager = state[ siteId ] ? state[ siteId ] : new PostQueryManager();
			const nextManager = manager.receive( posts, { query, found } );

			if ( nextManager === manager ) {
				return state;
			}

			return Object.assign( {}, state, {
				[ siteId ]: nextManager
			} );
		}

		case POSTS_RECEIVE:
			return reduce( groupBy( action.posts, 'site_ID' ), ( memo, posts, siteId ) => {
				if ( ! memo[ siteId ] ) {
					return memo;
				}

				const nextPosts = memo[ siteId ].receive( posts );
				if ( nextPosts === memo[ siteId ] ) {
					return memo;
				}

				if ( memo === state ) {
					memo = { ...memo };
				}

				memo[ siteId ] = nextPosts;
				return memo;
			}, state );

		case POST_SAVE: {
			const { siteId, postId, post } = action;
			if ( ! state[ siteId ] ) {
				break;
			}

			const nextPosts = state[ siteId ].receive( {
				ID: postId,
				...post
			}, { patch: true } );

			if ( nextPosts === state[ siteId ] ) {
				break;
			}

			return Object.assign( {}, state, {
				[ siteId ]: nextPosts
			} );
		}

		case POST_DELETE: {
			if ( ! state[ action.siteId ] ) {
				break;
			}

			const nextPosts = state[ action.siteId ].removeItem( action.postId );
			if ( nextPosts === state[ action.siteId ] ) {
				break;
			}

			return Object.assign( {}, state, {
				[ action.siteId ]: nextPosts
			} );
		}

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated editor posts state after an action has been dispatched.
 * The state maps site ID, post ID pairing to an object containing revisions
 * for the post.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function edits( state = {}, action ) {
	switch ( action.type ) {
		case POSTS_RECEIVE:
			return reduce( action.posts, ( memoState, post ) => {
				const postEdits = get( memoState, [ post.site_ID, post.ID ] );
				if ( ! postEdits ) {
					return memoState;
				} else if ( memoState === state ) {
					memoState = merge( {}, state );
				}

				return set( memoState, [ post.site_ID, post.ID ], omitBy( postEdits, ( value, key ) => {
					return isEqual( post[ key ], value );
				} ) );
			}, state );

		case POST_EDIT:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postId || '' ]: action.post
				}
			} );

		case POST_EDITS_RESET:
			if ( ! state.hasOwnProperty( action.siteId ) ) {
				break;
			}

			return Object.assign( {}, state, {
				[ action.siteId ]: omit( state[ action.siteId ], action.postId || '' )
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

export default combineReducers( {
	counts,
	items,
	siteRequests,
	queryRequests,
	queries,
	edits
} );
