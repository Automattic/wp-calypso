/**
 * External dependencies
 */
import { orderBy, has, map, unionBy, reject } from 'lodash';

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
	SERIALIZE
} from '../action-types';
import { combineReducersWithPersistence } from 'state/utils';
import {
	PLACEHOLDER_STATE
} from './constants';

const getCommentDate = ( { date } ) => new Date( date );

const getStateKey = ( siteId, postId ) => `${ siteId }-${ postId }`;

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
	const stateKey = getStateKey( siteId, postId );

	switch ( action.type ) {
		case COMMENTS_CHANGE_STATUS:
			const { status } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, { status } ) )
			};
		case COMMENTS_EDIT:
			const { content } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, { content } ) )
			};
		case COMMENTS_RECEIVE:
			const { skipSort, comments } = action;
			const allComments = unionBy( state[ stateKey ], comments, 'ID' );
			return {
				...state,
				[ stateKey ]: ! skipSort ? orderBy( allComments, getCommentDate, [ 'desc' ] ) : allComments
			};
		case COMMENTS_REMOVE:
			return {
				...state,
				[ stateKey ]: reject( state[ stateKey ], { ID: commentId } )
			};
		case COMMENTS_LIKE:
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, { i_like: true } ) )
			};
		case COMMENTS_LIKE_UPDATE:
			const { iLike, likeCount } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, { i_like: iLike, like_count: likeCount } ) )
			};
		case COMMENTS_UNLIKE:
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, { i_like: false } ) )
			};
		case COMMENTS_ERROR:
			const { error } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, {
					placeholderState: PLACEHOLDER_STATE.ERROR,
					placeholderError: error
				} ) )
			};
		case SERIALIZE:
		case DESERIALIZE:
			return {};
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
			const stateKey = getStateKey( siteId, postId );
			return {
				...state,
				[ stateKey ]: {
					...state[ stateKey ],
					[ requestId ]: type
				}
			};
		case SERIALIZE:
		case DESERIALIZE:
			return {};
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
			const { siteId, postId } = action;
			const stateKey = getStateKey( siteId, postId );
			return {
				...state,
				[ stateKey ]: action.totalCommentsCount
			};
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}
totalCommentsCount.hasCustomPersistence = true;

export default combineReducersWithPersistence( {
	items,
	requests,
	totalCommentsCount
} );
