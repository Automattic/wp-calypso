/**
 * External dependencies
 */
import { sortBy, has, map, union, reject } from 'lodash';

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
} from '../action-types';
import { combineReducersWithPersistence } from 'state/utils';
import {
	PLACEHOLDER_STATE
} from './constants';

const updateComment = ( commentId, newProperties ) => comment => {
	if ( comment.ID !== commentId ) {
		return comment;
	}
	const updateLikeCount = has( newProperties, 'i_like' ) && ! has( newProperties, 'like_count' );

	return {
		...comment,
		...newProperties,
		...updateLikeCount && {
			like_count: newProperties.i_like ? comment.like_count + 1 : comment.like_count - 1
		}
	};
};

/***
 * Comments items reducer, stores a comments items Immutable.List per siteId, postId
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export function items( state = {}, action ) {
	const { siteId, postId, commentId } = action;

	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
			const { status } = action;
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], updateComment( commentId, { status } ) )
			};
		case COMMENTS_EDIT:
			const { content } = action;
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], updateComment( commentId, { content } ) )
			};
		case COMMENTS_RECEIVE:
			const { skipSort, comments } = action;
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: union(
					state[ `${ siteId }-${ postId }` ],
					! skipSort ? sortBy( comments, [ 'date' ] ) : comments
				)
			};
		case COMMENTS_REMOVE:
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: reject( state[ `${ siteId }-${ postId }` ], { ID: commentId } )
			};
		case COMMENTS_LIKE:
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], updateComment( commentId, { i_like: true } ) )
			};
		case COMMENTS_LIKE_UPDATE:
			const { iLike, likeCount } = action;
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], updateComment( commentId, {
					i_like: iLike,
					like_count: likeCount
				} ) )
			};
		case COMMENTS_UNLIKE:
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], updateComment( commentId, { i_like: false } ) )
			};
		case COMMENTS_ERROR:
			const { error } = action;
			return {
				...state,
				[ `${ siteId }-${ postId }` ]: map( state[ `${ siteId }-${ postId }` ], updateComment( commentId, {
					placeholderState: PLACEHOLDER_STATE.ERROR,
					placeholderError: error
				} ) )
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
