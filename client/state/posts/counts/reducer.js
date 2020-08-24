/**
 * External dependencies
 */
import { get, merge, omit, pick } from 'lodash';

/**
 * Internal dependencies
 */
import {
	CURRENT_USER_RECEIVE,
	POST_COUNTS_RECEIVE,
	POST_COUNTS_REQUEST,
	POST_COUNTS_REQUEST_SUCCESS,
	POST_COUNTS_REQUEST_FAILURE,
	POST_COUNTS_RESET_INTERNAL_STATE,
	POST_DELETE,
	POST_SAVE,
	POSTS_RECEIVE,
} from 'state/action-types';
import { combineReducers, withSchemaValidation } from 'state/utils';
import { countsSchema } from './schema';

/**
 * Returns the updated post types requesting state after an action has been
 * dispatched. The state reflects a mapping of site ID, post type pairing to a
 * boolean reflecting whether a request for the post types is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case POST_COUNTS_REQUEST:
		case POST_COUNTS_REQUEST_SUCCESS:
		case POST_COUNTS_REQUEST_FAILURE:
			return merge( {}, state, {
				[ action.siteId ]: {
					[ action.postType ]: POST_COUNTS_REQUEST === action.type,
				},
			} );
	}

	return state;
}

/**
 * Returns the updated post count state after an action has been dispatched.
 * The state reflects a mapping of site ID, post type, [all/mine], post status
 * to the number of posts.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const counts = ( () => {
	let currentUserId;
	let postStatuses = {};

	/**
	 * Returns a serialized key to be used in tracking post status properties
	 *
	 * @param  {number} siteId Site ID
	 * @param  {number} postId Post ID
	 * @returns {string}        Serialized key
	 */
	function getPostStatusKey( siteId, postId ) {
		return [ siteId, postId ].join();
	}

	/**
	 * Returns the updated post count state after transitioning a post to a new
	 * status.
	 *
	 * @param  {object} state  Current state
	 * @param  {number} siteId Site ID
	 * @param  {number} postId Post ID
	 * @param  {string} status Post status
	 * @returns {object}        Updated state
	 */
	function transitionPostStateToStatus( state, siteId, postId, status ) {
		const postStatusKey = getPostStatusKey( siteId, postId );
		const postStatus = postStatuses[ postStatusKey ];
		if ( ! postStatus ) {
			return state;
		}

		// Determine which count subkeys need to be updated, depending on
		// whether the current user authored the post
		const subKeys = [ 'all' ];
		if ( postStatus.authorId === currentUserId ) {
			subKeys.push( 'mine' );
		}

		const revisions = subKeys.reduce( ( memo, subKey ) => {
			const subKeyCounts = get( state, [ siteId, postStatus.type, subKey ], {} );

			memo[ subKey ] = {};

			// Decrement count from the current status before transitioning
			memo[ subKey ][ postStatus.status ] = Math.max(
				( subKeyCounts[ postStatus.status ] || 0 ) - 1,
				0
			);

			// So long as we're not trashing an already trashed post or page,
			// increment the count for the transitioned status
			if ( 'deleted' !== status ) {
				memo[ subKey ][ status ] = ( subKeyCounts[ status ] || 0 ) + 1;
			}

			return memo;
		}, {} );

		if ( 'deleted' === status ) {
			// If post is permanently deleted, omit from tracked statuses
			postStatuses = omit( postStatuses, postStatusKey );
		} else {
			// Otherwise, update object to reflect new status
			postStatus.status = status;
		}

		// Ensure that `all` and `mine` keys are always present
		merge( revisions, {
			all: {},
			mine: {},
		} );

		return merge( {}, state, {
			[ siteId ]: {
				[ postStatus.type ]: revisions,
			},
		} );
	}

	return withSchemaValidation( countsSchema, ( state = {}, action ) => {
		switch ( action.type ) {
			case POST_COUNTS_RESET_INTERNAL_STATE: {
				currentUserId = undefined;
				postStatuses = {};

				return state;
			}
			case CURRENT_USER_RECEIVE: {
				currentUserId = action.user.ID;

				return state;
			}
			case POSTS_RECEIVE: {
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
			}
			case POST_SAVE: {
				const { siteId, postId, post } = action;
				if ( ! post.status ) {
					return state;
				}

				return transitionPostStateToStatus( state, siteId, postId, post.status );
			}
			case POST_DELETE: {
				return transitionPostStateToStatus( state, action.siteId, action.postId, 'deleted' );
			}
			case POST_COUNTS_RECEIVE: {
				return merge( {}, state, {
					[ action.siteId ]: {
						[ action.postType ]: action.counts,
					},
				} );
			}
		}

		return state;
	} );
} )();

export default combineReducers( {
	requesting,
	counts,
} );
