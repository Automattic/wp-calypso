/* eslint-disable no-case-declarations */

import {
	get,
	set,
	omit,
	omitBy,
	isEmpty,
	isEqual,
	reduce,
	merge,
	findKey,
	mapValues,
} from 'lodash';
import PostQueryManager from 'calypso/lib/query-manager/post';
import withQueryManager from 'calypso/lib/query-manager/with-query-manager';
import {
	EDITOR_STOP,
	POST_DELETE,
	POST_DELETE_SUCCESS,
	POST_DELETE_FAILURE,
	POST_EDIT,
	POST_REQUEST,
	POST_REQUEST_SUCCESS,
	POST_REQUEST_FAILURE,
	POST_RESTORE,
	POST_RESTORE_FAILURE,
	POST_SAVE,
	POST_SAVE_SUCCESS,
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_SUCCESS,
	POSTS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { getFeaturedImageId } from 'calypso/state/posts/utils';
import { combineReducers, withSchemaValidation, withPersistence } from 'calypso/state/utils';
import counts from './counts/reducer';
import likes from './likes/reducer';
import { itemsSchema, queriesSchema, allSitesQueriesSchema } from './schema';
import {
	appendToPostEditsLog,
	getSerializedPostsQuery,
	getUnappliedMetadataEdits,
	isAuthorEqual,
	isDateEqual,
	isDiscussionEqual,
	isStatusEqual,
	isTermsEqual,
	mergePostEdits,
	normalizePostForState,
} from './utils';

/**
 * Tracks all known post objects, indexed by post global ID.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case POSTS_RECEIVE: {
			return reduce(
				action.posts,
				( memo, post ) => {
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
				},
				state
			);
		}
		case POST_DELETE_SUCCESS: {
			const globalId = findKey( state, ( [ siteId, postId ] ) => {
				return siteId === action.siteId && postId === action.postId;
			} );

			if ( ! globalId ) {
				return state;
			}

			return omit( state, globalId );
		}
	}

	return state;
} );

/**
 * Returns the updated site post requests state after an action has been
 * dispatched. The state reflects a mapping of site ID, post ID pairing to a
 * boolean reflecting whether a request for the post is in progress.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export function siteRequests( state = {}, action ) {
	switch ( action.type ) {
		case POST_REQUEST:
		case POST_REQUEST_SUCCESS:
		case POST_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, state[ action.siteId ], {
					[ action.postId ]: POST_REQUEST === action.type,
				} ),
			} );
	}

	return state;
}

/**
 * Returns the updated post query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export function queryRequests( state = {}, action ) {
	switch ( action.type ) {
		case POSTS_REQUEST:
		case POSTS_REQUEST_SUCCESS:
		case POSTS_REQUEST_FAILURE:
			const serializedQuery = getSerializedPostsQuery( action.query, action.siteId );
			return Object.assign( {}, state, {
				[ serializedQuery ]: POSTS_REQUEST === action.type,
			} );
	}

	return state;
}

/**
 * Returns the updated post query state after an action has been dispatched.
 * The state reflects a mapping by site ID of serialized query key to an array
 * of post IDs for the query, if a query response was successfully received.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
const queriesReducer = ( state = {}, action ) => {
	switch ( action.type ) {
		case POSTS_REQUEST_SUCCESS: {
			const { siteId, query, posts, found } = action;
			if ( ! siteId ) {
				// Handle site-specific queries only
				return state;
			}
			const normalizedPosts = posts.map( normalizePostForState );
			return withQueryManager(
				state,
				siteId,
				( m ) => m.receive( normalizedPosts, { query, found } ),
				() => new PostQueryManager()
			);
		}
		case POSTS_RECEIVE: {
			const { posts } = action;
			const postsBySiteId = reduce(
				posts,
				( memo, post ) => {
					return Object.assign( memo, {
						[ post.site_ID ]: [ ...( memo[ post.site_ID ] || [] ), normalizePostForState( post ) ],
					} );
				},
				{}
			);

			return reduce(
				postsBySiteId,
				( memo, sitePosts, siteId ) =>
					withQueryManager(
						memo,
						siteId,
						( m ) => m.receive( sitePosts ),
						() => new PostQueryManager()
					),
				state
			);
		}
		case POST_RESTORE: {
			const { siteId, postId } = action;
			return withQueryManager( state, siteId, ( m ) =>
				m.receive( { ID: postId, status: '__RESTORE_PENDING' }, { patch: true } )
			);
		}
		case POST_RESTORE_FAILURE: {
			const { siteId, postId } = action;
			return withQueryManager( state, siteId, ( m ) =>
				m.receive( { ID: postId, status: 'trash' }, { patch: true } )
			);
		}
		case POST_SAVE: {
			const { siteId, postId, post } = action;
			return withQueryManager( state, siteId, ( m ) =>
				m.receive( { ID: postId, ...post }, { patch: true } )
			);
		}
		case POST_DELETE: {
			const { siteId, postId } = action;
			return withQueryManager( state, siteId, ( m ) =>
				m.receive( { ID: postId, status: '__DELETE_PENDING' }, { patch: true } )
			);
		}
		case POST_DELETE_FAILURE: {
			const { siteId, postId } = action;
			return withQueryManager( state, siteId, ( m ) =>
				m.receive( { ID: postId, status: 'trash' }, { patch: true } )
			);
		}
		case POST_DELETE_SUCCESS: {
			const { siteId, postId } = action;
			return withQueryManager( state, siteId, ( m ) => m.removeItem( postId ) );
		}
	}

	return state;
};

export const queries = withSchemaValidation(
	queriesSchema,
	withPersistence( queriesReducer, {
		serialize: ( state ) => mapValues( state, ( { data, options } ) => ( { data, options } ) ),
		deserialize: ( persisted ) =>
			mapValues( persisted, ( { data, options } ) => new PostQueryManager( data, options ) ),
	} )
);

function findItemKey( state, siteId, postId ) {
	return (
		findKey( state.data.items, ( post ) => {
			return post.site_ID === siteId && post.ID === postId;
		} ) || null
	);
}

/**
 * Returns the updated post query state for queries of all sites at once after
 * an action has been dispatched.  The state reflects a mapping of serialized
 * query key to an array of post global IDs for the query, if a query response
 * was successfully received.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
const allSitesQueriesReducer = (
	state = new PostQueryManager( {}, { itemKey: 'global_ID' } ),
	action
) => {
	switch ( action.type ) {
		case POSTS_REQUEST_SUCCESS: {
			const { siteId, query, posts, found } = action;
			if ( siteId ) {
				// Handle all-sites queries only.
				return state;
			}
			return state.receive( posts.map( normalizePostForState ), { query, found } );
		}
		case POSTS_RECEIVE: {
			const { posts } = action;
			return state.receive( posts );
		}
		case POST_RESTORE: {
			const { siteId, postId } = action;
			const globalId = findItemKey( state, siteId, postId );
			return state.receive( { global_ID: globalId, status: '__RESTORE_PENDING' }, { patch: true } );
		}
		case POST_RESTORE_FAILURE: {
			const { siteId, postId } = action;
			const globalId = findItemKey( state, siteId, postId );
			return state.receive( { global_ID: globalId, status: 'trash' }, { patch: true } );
		}
		case POST_SAVE: {
			const { siteId, postId, post } = action;
			const globalId = findItemKey( state, siteId, postId );
			return state.receive( { global_ID: globalId, ...post }, { patch: true } );
		}
		case POST_DELETE: {
			const { siteId, postId } = action;
			const globalId = findItemKey( state, siteId, postId );
			return state.receive( { global_ID: globalId, status: '__DELETE_PENDING' }, { patch: true } );
		}
		case POST_DELETE_FAILURE: {
			const { siteId, postId } = action;
			const globalId = findItemKey( state, siteId, postId );
			return state.receive( { global_ID: globalId, status: 'trash' }, { patch: true } );
		}
		case POST_DELETE_SUCCESS: {
			const { siteId, postId } = action;
			const globalId = findItemKey( state, siteId, postId );
			return state.removeItem( globalId );
		}
	}

	return state;
};

export const allSitesQueries = withSchemaValidation(
	allSitesQueriesSchema,
	withPersistence( allSitesQueriesReducer, {
		serialize: ( { data, options } ) => ( { data, options } ),
		deserialize: ( { data, options } ) => new PostQueryManager( data, options ),
	} )
);

/**
 * Returns the updated editor posts state after an action has been dispatched.
 * The state maps site ID, post ID pairing to an object containing revisions
 * for the post.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export function edits( state = {}, action ) {
	switch ( action.type ) {
		case POSTS_RECEIVE:
			return reduce(
				action.posts,
				( memoState, post ) => {
					// Receive a new version of a post object, in most cases returned in the POST
					// response after a successful save. Removes the edits that have been applied
					// and leaves only the ones that are not noops.
					let postEditsLog = get( memoState, [ post.site_ID, post.ID ] );

					if ( ! postEditsLog ) {
						return memoState;
					}

					if ( memoState === state ) {
						memoState = merge( {}, state );
					}

					// if the action has a save marker, remove the edits before that marker
					if ( action.saveMarker ) {
						const markerIndex = postEditsLog.indexOf( action.saveMarker );
						if ( markerIndex !== -1 ) {
							postEditsLog = postEditsLog.slice( markerIndex + 1 );
						}
					}

					// merge the array of remaining edits into one object
					const postEdits = mergePostEdits( ...postEditsLog );
					let newEditsLog = null;

					if ( postEdits ) {
						// remove the edits that try to set an attribute to a value it already has.
						// For most attributes, it's a simple `isEqual` deep comparison, but a few
						// properties are more complicated than that.
						const unappliedPostEdits = omitBy( postEdits, ( value, key ) => {
							switch ( key ) {
								case 'author':
									return isAuthorEqual( value, post[ key ] );
								case 'date':
									return isDateEqual( value, post[ key ] );
								case 'discussion':
									return isDiscussionEqual( value, post[ key ] );
								case 'featured_image':
									return value === getFeaturedImageId( post );
								case 'metadata':
									// omit from unappliedPostEdits, metadata edits will be merged
									return true;
								case 'status':
									return isStatusEqual( value, post[ key ] );
								case 'terms':
									return isTermsEqual( value, post[ key ] );
							}
							return isEqual( post[ key ], value );
						} );

						// remove edits that are already applied in the incoming metadata values and
						// leave only the unapplied ones.
						if ( postEdits.metadata ) {
							const unappliedMetadataEdits = getUnappliedMetadataEdits(
								postEdits.metadata,
								post.metadata
							);
							if ( unappliedMetadataEdits.length > 0 ) {
								unappliedPostEdits.metadata = unappliedMetadataEdits;
							}
						}

						if ( ! isEmpty( unappliedPostEdits ) ) {
							newEditsLog = [ unappliedPostEdits ];
						}
					}

					return set( memoState, [ post.site_ID, post.ID ], newEditsLog );
				},
				state
			);

		case POST_EDIT: {
			// process new edit for a post: merge it into the existing edits
			const siteId = action.siteId;
			const postId = action.postId || '';
			const postEditsLog = get( state, [ siteId, postId ] );
			const newEditsLog = appendToPostEditsLog( postEditsLog, action.post );

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ postId ]: newEditsLog,
				},
			};
		}

		case EDITOR_STOP:
			if ( ! state.hasOwnProperty( action.siteId ) ) {
				break;
			}

			return Object.assign( {}, state, {
				[ action.siteId ]: omit( state[ action.siteId ], action.postId || '' ),
			} );

		case POST_SAVE_SUCCESS: {
			const siteId = action.siteId;
			const postId = action.postId || '';

			// if new post (edited with a transient postId of '') has been just saved and assigned
			// a real numeric ID, rewrite the state key with the new postId.
			if ( postId === '' && action.savedPost && state[ siteId ] ) {
				const newPostId = action.savedPost.ID;
				state = {
					...state,
					[ siteId ]: Object.fromEntries(
						Object.entries( state[ siteId ] ).map( ( [ key, value ] ) => [
							key === '' ? newPostId : key,
							value,
						] )
					),
				};
			}

			return state;
		}
	}

	return state;
}

export default combineReducers( {
	counts,
	items,
	siteRequests,
	queryRequests,
	queries,
	allSitesQueries,
	edits,
	likes,
} );
