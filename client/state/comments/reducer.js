/**
 * External dependencies
 */
import { isUndefined, orderBy, has, map, unionBy, reject, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import {
	COMMENTS_CHANGE_STATUS,
	COMMENTS_EDIT,
	COMMENTS_RECEIVE,
	COMMENTS_DELETE,
	COMMENTS_ERROR,
	COMMENTS_COUNT_INCREMENT,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_LIKE,
	COMMENTS_UNLIKE,
} from '../action-types';
import { combineReducers, createReducer } from 'state/utils';
import { PLACEHOLDER_STATE, NUMBER_OF_COMMENTS_PER_FETCH } from './constants';

const getCommentDate = ( { date } ) => new Date( date );

export const getStateKey = ( siteId, postId ) => `${ siteId }-${ postId }`;

const updateComment = ( commentId, newProperties ) => comment => {
	if ( comment.ID !== commentId ) {
		return comment;
	}
	const updateLikeCount = has( newProperties, 'i_like' ) && isUndefined( newProperties.like_count );

	return {
		...comment,
		...newProperties,
		...( updateLikeCount && {
			like_count: newProperties.i_like ? comment.like_count + 1 : comment.like_count - 1,
		} ),
	};
};

/***
 * Comments items reducer, stores a comments items Immutable.List per siteId, postId
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export function items( state = {}, action ) {
	const { type, siteId, postId, commentId, like_count } = action;
	const stateKey = getStateKey( siteId, postId );

	switch ( type ) {
		case COMMENTS_CHANGE_STATUS:
			const { status } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, { status } ) ),
			};
		case COMMENTS_EDIT:
			const { content } = action;
			return {
				...state,
				[ stateKey ]: map( state[ stateKey ], updateComment( commentId, { content } ) ),
			};
		case COMMENTS_RECEIVE:
			const { skipSort, comments } = action;
			const allComments = unionBy( state[ stateKey ], comments, 'ID' );
			return {
				...state,
				[ stateKey ]: ! skipSort ? orderBy( allComments, getCommentDate, [ 'desc' ] ) : allComments,
			};
		case COMMENTS_DELETE:
			return {
				...state,
				[ stateKey ]: reject( state[ stateKey ], { ID: commentId } ),
			};
		case COMMENTS_LIKE:
			return {
				...state,
				[ stateKey ]: map(
					state[ stateKey ],
					updateComment( commentId, { i_like: true, like_count } ),
				),
			};
		case COMMENTS_UNLIKE:
			return {
				...state,
				[ stateKey ]: map(
					state[ stateKey ],
					updateComment( commentId, { i_like: false, like_count } ),
				),
			};
		case COMMENTS_ERROR:
			const { error } = action;
			return {
				...state,
				[ stateKey ]: map(
					state[ stateKey ],
					updateComment( commentId, {
						placeholderState: PLACEHOLDER_STATE.ERROR,
						placeholderError: error,
					} ),
				),
			};
	}

	return state;
}

export const fetchStatusInitialState = {
	before: true,
	after: true,
	hasReceivedBefore: false,
	hasReceivedAfter: false,
};

/***
 * Stores whether or not there are more comments, and in which directions, for a particular post.
 * Also includes whether or not a before/after has ever been queried
 * Example state:
 *  {
 *     [ siteId-postId ]: {
 *       before: bool,
 *       after: bool,
 *       hasReceivedBefore: bool,
 *       hasReceivedAfter: bool,
 *     }
 *  }
 *
 * @param {Object} state redux state
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export const fetchStatus = createReducer(
	{},
	{
		[ COMMENTS_RECEIVE ]: ( state, action ) => {
			const { siteId, postId, direction, commentById } = action;
			const stateKey = getStateKey( siteId, postId );

			if ( commentById ) {
				return state;
			}

			const hasReceivedDirection =
				direction === 'before' ? 'hasReceivedBefore' : 'hasReceivedAfter';

			const nextState = {
				...( state[ stateKey ] || fetchStatusInitialState ),
				[ direction ]: action.comments.length === NUMBER_OF_COMMENTS_PER_FETCH,
				[ hasReceivedDirection ]: true,
			};

			return isEqual( state[ stateKey ], nextState )
				? state
				: { ...state, [ stateKey ]: nextState };
		},
	},
);

/***
 * Stores latest comments count for post we've seen from the server
 * @param {Object} state redux state, prev totalCommentsCount
 * @param {Object} action redux action
 * @returns {Object} new redux state
 */
export function totalCommentsCount( state = {}, action ) {
	const { siteId, postId } = action;
	const stateKey = getStateKey( siteId, postId );

	switch ( action.type ) {
		case COMMENTS_COUNT_RECEIVE:
			return {
				...state,
				[ stateKey ]: action.totalCommentsCount,
			};
		case COMMENTS_COUNT_INCREMENT:
			return {
				...state,
				[ stateKey ]: state[ stateKey ] + 1,
			};
	}

	return state;
}

export default combineReducers( {
	items,
	fetchStatus,
	totalCommentsCount,
} );
