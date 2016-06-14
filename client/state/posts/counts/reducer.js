/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import includes from 'lodash/includes';
import omit from 'lodash/omit';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import {
	CURRENT_USER_ID_SET,
	POST_COUNTS_RECEIVE,
	POST_COUNTS_REQUEST,
	POST_COUNTS_REQUEST_SUCCESS,
	POST_COUNTS_REQUEST_FAILURE,
	POST_COUNTS_RESET_INTERNAL_STATE,
	POST_DELETE,
	POSTS_RECEIVE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { countsSchema } from './schema';
import { createReducer } from 'state/utils';

/**
 * Returns the updated post types requesting state after an action has been
 * dispatched. The state reflects a mapping of site ID, post type pairing to a
 * boolean reflecting whether a request for the post types is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_COUNTS_REQUEST:
		case POST_COUNTS_REQUEST_SUCCESS:
		case POST_COUNTS_REQUEST_FAILURE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postType ]: POST_COUNTS_REQUEST === action.type
				}
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated post count state after an action has been dispatched.
 * The state reflects a mapping of site ID, post type, [all/mine], post status
 * to the number of posts.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const counts = ( () => {
	let currentUserId;
	let postStatuses = {};

	/**
	 * Returns a serialized key to be used in tracking post status properties
	 *
	 * @param  {Number} siteId Site ID
	 * @param  {Number} postId Post ID
	 * @return {String}        Serialized key
	 */
	function getPostStatusKey( siteId, postId ) {
		return [ siteId, postId ].join();
	}

	/**
	 * Returns true if the status transition will result in the post being
	 * permanently deleted, which is derived by the post's current status and
	 * type.
	 *
	 * @param  {String}  nextStatus Post's next (transitioning) status
	 * @param  {String}  status     Post's current status
	 * @param  {String}  type       Post's type
	 * @return {Boolean}            Whether post is to be permanently deleted
	 */
	function isPermanentlyDeleting( nextStatus, status, type ) {
		if ( 'trash' !== nextStatus ) {
			return false;
		}

		return 'trash' === status || ! includes( [ 'post', 'page' ], type );
	}

	/**
	 * Returns the updated post count state after transitioning a post to a new
	 * status.
	 *
	 * @param  {Object} state  Current state
	 * @param  {Number} siteId Site ID
	 * @param  {Number} postId Post ID
	 * @param  {String} status Post status
	 * @return {Object}        Updated state
	 */
	function transitionPostStateToStatus( state, siteId, postId, status ) {
		if ( ! state[ siteId ] ) {
			return state;
		}

		const postStatusKey = getPostStatusKey( siteId, postId );
		const postStatus = postStatuses[ postStatusKey ];
		if ( ! postStatus || ! state[ siteId ][ postStatus.type ] ) {
			return state;
		}

		// Determine which count subkeys need to be updated, depending on
		// whether the current user authored the post
		const subKeys = [ 'all' ];
		if ( postStatus.authorId === currentUserId ) {
			subKeys.push( 'mine' );
		}

		const revisions = subKeys.reduce( ( memo, subKey ) => {
			const subKeyCounts = state[ siteId ][ postStatus.type ][ subKey ];

			memo[ subKey ] = {};

			// Decrement count from the current status before transitioning
			memo[ subKey ][ postStatus.status ] = ( subKeyCounts[ postStatus.status ] || 0 ) - 1;

			// So long as we're not trashing an already trashed post or page,
			// increment the count for the transitioned status
			if ( ! isPermanentlyDeleting( status, postStatus.status, postStatus.type ) ) {
				memo[ subKey ][ status ] = ( subKeyCounts[ status ] || 0 ) + 1;
			}

			return memo;
		}, {} );

		if ( isPermanentlyDeleting( status, postStatus.status, postStatus.type ) ) {
			// If post is permanently deleted, omit from tracked statuses
			postStatuses = omit( postStatuses, postStatusKey );
		} else {
			// Otherwise, update object to reflect new status
			postStatus.status = status;
		}

		return merge( {}, state, {
			[ siteId ]: {
				[ postStatus.type ]: revisions
			}
		} );
	}

	return createReducer( {}, {
		[ POST_COUNTS_RESET_INTERNAL_STATE ]: ( state ) => {
			currentUserId = undefined;
			postStatuses = {};

			return state;
		},
		[ CURRENT_USER_ID_SET ]: ( state, action ) => {
			currentUserId = action.userId;

			return state;
		},
		[ POSTS_RECEIVE ]: ( state, action ) => {
			action.posts.forEach( ( post ) => {
				const postStatusKey = getPostStatusKey( post.site_ID, post.ID );
				const postStatus = postStatuses[ postStatusKey ];

				// If the post is known to us and the status has changed,
				// update state to reflect change
				if ( postStatus && post.status !== postStatus.status ) {
					state = transitionPostStateToStatus( state, post.site_ID, post.ID, post.status );
				}

				postStatuses[ postStatusKey ] = pick( post, 'type', 'status' );
				postStatuses[ postStatusKey ].authorId = get( post.author, 'ID' );
			} );

			return state;
		},
		[ POST_DELETE ]: ( state, action ) => {
			return transitionPostStateToStatus( state, action.siteId, action.postId, 'trash' );
		},
		[ POST_COUNTS_RECEIVE ]: ( state, action ) => {
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postType ]: action.counts
				}
			} );
		}
	}, countsSchema );
} )();

export default combineReducers( {
	requesting,
	counts
} );
