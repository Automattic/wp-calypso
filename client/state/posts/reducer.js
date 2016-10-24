/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get, set, omit, omitBy, isEqual, reduce, merge, findKey, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import PostQueryManager from 'lib/query-manager/post';
import {
	POST_DELETE,
	POST_DELETE_SUCCESS,
	POST_DELETE_FAILURE,
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
import {
	getSerializedPostsQuery,
	mergeIgnoringArrays,
	normalizePostForState
} from './utils';
import { createReducer, isValidStateWithSchema } from 'state/utils';
import { itemsSchema, queriesSchema } from './schema';

/**
 * Tracks all known post objects, indexed by post global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ POSTS_RECEIVE ]: ( state, action ) => {
		return reduce( action.posts, ( memo, post ) => {
			const { site_ID: siteId, ID: postId, global_ID: globalId } = post;
			if ( memo[ globalId ] ) {
				// We're making an assumption here that the site ID and post ID
				// corresponding with a global ID will never change
				return memo;
			}

			if ( memo === state ) {
				memo = { ...memo };
			}

			memo[ globalId ] = [ siteId, postId ];
			return memo;
		}, state );
	},
	[ POST_DELETE_SUCCESS ]: ( state, action ) => {
		const globalId = findKey( state, ( [ siteId, postId ] ) => {
			return siteId === action.siteId && postId === action.postId;
		} );

		if ( ! globalId ) {
			return state;
		}

		return omit( state, globalId );
	}
}, itemsSchema );

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
export const queries = ( () => {
	function applyToManager( state, siteId, method, createDefault, ...args ) {
		if ( ! state[ siteId ] ) {
			if ( ! createDefault ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: ( new PostQueryManager() )[ method ]( ...args )
			};
		}

		const nextManager = state[ siteId ][ method ]( ...args );
		if ( nextManager === state[ siteId ] ) {
			return state;
		}

		return {
			...state,
			[ siteId ]: nextManager
		};
	}

	return createReducer( {}, {
		[ POST_RESTORE ]: ( state, { siteId, postId } ) => {
			return applyToManager( state, siteId, 'receive', false, {
				ID: postId,
				status: '__RESTORE_PENDING'
			}, { patch: true } );
		},
		[ POST_RESTORE_FAILURE ]: ( state, { siteId, postId } ) => {
			return applyToManager( state, siteId, 'receive', false, {
				ID: postId,
				status: 'trash'
			}, { patch: true } );
		},
		[ POSTS_REQUEST_SUCCESS ]: ( state, { siteId, query, posts, found } ) => {
			const normalizedPosts = posts.map( normalizePostForState );
			return applyToManager( state, siteId, 'receive', true, normalizedPosts, { query, found } );
		},
		[ POSTS_RECEIVE ]: ( state, { posts } ) => {
			const postsBySiteId = reduce( posts, ( memo, post ) => {
				return Object.assign( memo, {
					[ post.site_ID ]: [
						...( memo[ post.site_ID ] || [] ),
						normalizePostForState( post )
					]
				} );
			}, {} );

			return reduce( postsBySiteId, ( memo, sitePosts, siteId ) => {
				return applyToManager( memo, siteId, 'receive', true, sitePosts );
			}, state );
		},
		[ POST_SAVE ]: ( state, { siteId, postId, post } ) => {
			return applyToManager( state, siteId, 'receive', false, {
				ID: postId,
				...post
			}, { patch: true } );
		},
		[ POST_DELETE ]: ( state, { siteId, postId } ) => {
			return applyToManager( state, siteId, 'receive', false, {
				ID: postId,
				status: '__DELETE_PENDING'
			}, { patch: true } );
		},
		[ POST_DELETE_FAILURE ]: ( state, { siteId, postId } ) => {
			return applyToManager( state, siteId, 'receive', false, {
				ID: postId,
				status: 'trash'
			}, { patch: true } );
		},
		[ POST_DELETE_SUCCESS ]: ( state, { siteId, postId } ) => {
			return applyToManager( state, siteId, 'removeItem', false, postId );
		},
		[ SERIALIZE ]: ( state ) => {
			return mapValues( state, ( { data, options } ) => ( { data, options } ) );
		},
		[ DESERIALIZE ]: ( state ) => {
			if ( ! isValidStateWithSchema( state, queriesSchema ) ) {
				return {};
			}

			return mapValues( state, ( { data, options } ) => {
				return new PostQueryManager( data, options );
			} );
		}
	} );
} )();

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
			return mergeIgnoringArrays( {}, state, {
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
