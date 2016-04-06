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
import merge from 'lodash/merge';
import mapValues from 'lodash/mapValues';
import findKey from 'lodash/findKey';
import includes from 'lodash/includes';

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
	getSerializedPostsQueryWithoutPage
} from './utils';
import { DEFAULT_POST_QUERY } from './constants';
import { itemsSchema, queriesSchema } from './schema';
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

			// Posts and pages are first sent to trash before being permanently
			// deleted. Therefore, only omit if already trashed or custom type.
			const post = state[ globalId ];
			if ( 'trash' === post.status || ! includes( [ 'post', 'page' ], post.type ) ) {
				return omit( state, globalId );
			}

			return merge( {}, state, {
				[ globalId ]: { status: 'trash' }
			} );

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
		case POSTS_REQUEST_SUCCESS: {
			const { siteId, query, posts } = action;
			if ( ! state[ siteId ] ) {
				state[ siteId ] = new PostQueryManager();
			}

			const nextPosts = state[ siteId ].receive( posts, { query } );
			if ( nextPosts === state[ siteId ] ) {
				return state;
			}

			return Object.assign( {}, state, {
				[ siteId ]: nextPosts
			} );
		}

		case POST_DELETE: {
			if ( ! state[ action.siteId ] ) {
				return state;
			}

			const nextPosts = state[ action.siteId ].receive( {
				ID: action.postId,
				status: 'trash'
			}, { patch: true } );

			if ( nextPosts === state[ action.siteId ] ) {
				return state;
			}

			return Object.assign( {}, state, {
				[ action.siteId ]: nextPosts
			} );
		}

		case SERIALIZE:
			return mapValues( state, ( queryManager ) => queryManager.toJSON() );

		case DESERIALIZE:
			if ( isValidStateWithSchema( state, queriesSchema ) ) {
				return mapValues( state, ( serializedQuery ) => {
					return PostQueryManager.parse( serializedQuery );
				} );
			}

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
	queriesLastPage,
	edits
} );
