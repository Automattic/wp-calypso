/**
 * External dependencies
 */
import { sortBy, findIndex, filter, map } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_EDIT,
	COMMENTS_RECEIVE,
	COMMENTS_REMOVE,
	COMMENTS_ERROR,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_LIKE,
	COMMENTS_LIKE_UPDATE,
	COMMENTS_UNLIKE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
	COMMENTS_REQUEST_FAILURE,
	DESERIALIZE,
	SERIALIZE,
} from '../action-types';
import { combineReducersWithPersistence } from 'state/utils';
import {
	PLACEHOLDER_STATE
} from './constants';

/***
 * Comments items reducer, stores a comments items Immutable.List per siteId, postId
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export function items( state = {}, action ) {
	const { siteId, postId, commentId, skipSort } = action;

	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
			const { status } = action;
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], comment => {
					if ( comment.ID !== commentId ) {
						return comment;
					}

					return {
						...comment,
						status
					};
				} )
			};
		case COMMENTS_EDIT:
			const { content } = action;
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], comment => {
					if ( comment.ID !== commentId ) {
						return comment;
					}

					return {
						...comment,
						content
					};
				} )
			};
		case COMMENTS_RECEIVE:
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: ! skipSort ? sortBy( action.comments, [ 'date' ] ) : action.comments
			};
		case COMMENTS_REMOVE:
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: filter( state[ `${ siteId }-${ postId }` ], { ID: commentId } )
			};
		case COMMENTS_LIKE:
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], comment => {
					if ( comment.ID !== commentId ) {
						return comment;
					}

					return {
						...comment,
						i_like: true,
						like_count: comment.like_count++
					};
				} )
			};
		case COMMENTS_LIKE_UPDATE:
			const { iLike, likeCount } = action;
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], comment => {
					if ( comment.ID !== commentId ) {
						return comment;
					}

					return {
						...comment,
						i_like: iLike,
						like_count: likeCount
					};
				} )
			};
		case COMMENTS_UNLIKE:
			const { commentId } = action;
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], comment => {
					if ( comment.ID !== commentId ) {
						return comment;
					}

					return {
						...comment,
						i_like: false,
						like_count: comment.like_count--
					};
				} )
			};
		case COMMENTS_ERROR:
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], comment => {
					if ( comment.ID !== commentId ) {
						return comment;
					}

					return {
						...comment,
						placeholderState: PLACEHOLDER_STATE.ERROR,
						placeholderError: action.error
					};
				} )
			};
	}

	return state;
}
items.hasCustomPersistence = true;

/***
 * Stores information regarding requests status per requestId
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export function requests( state = {}, action ) {
	switch ( action.type ) {
		case COMMENTS_REQUEST:
		case COMMENTS_REQUEST_SUCCESS:
		case COMMENTS_REQUEST_FAILURE:
			const { siteId, postId, requestId, type } = action;
			const stateKey = `${ siteId }-${ postId }`;
			return {
				...state,
				[ stateKey ]: {
					...state[ stateKey ],
					[ requestId ]: type
				}
			};
	}

	return state;
}
requests.hasCustomPersistence = true;

/***
 * Stores latest comments count for post we've seen from the server
 * @param {Object} state redux state, prev totalCommentsCount
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export function totalCommentsCount( state = {}, action ) {
	switch ( action.type ) {
		case COMMENTS_COUNT_RECEIVE:
			const { siteId, postId, totalCommentsCount } = action;
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: totalCommentsCount
			}
	}

	return state;
}
totalCommentsCount.hasCustomPersistence = true;

export default combineReducersWithPersistence( {
	items,
	requests,
	totalCommentsCount
} );
