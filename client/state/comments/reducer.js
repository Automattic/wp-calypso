/**
 * External dependencies
 */
import Immutable from 'immutable';
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
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
import {
	getCommentParentKey,
	updateExistingIn
} from './utils';
import {
	PLACEHOLDER_STATE
} from './constants';

/***
 * Creates a function that updates like count
 * @param {Boolean} like true to like, false to unlike
 * @returns {Function} function that updates like count for comment
 */
function getLikeSetter( { like = true, likeCount } ) {
	return ( comment ) => comment.set( 'i_like', like )
								.update( 'like_count', ( count ) => {
									if ( typeof likeCount !== 'undefined' ) {
										return likeCount;
									}

									return like ? count + 1 : count - 1;
								} );
}

/***
 * Updates a specific state in the general state
 * @param {Immutable.Map} state general state for all commentTargetId
 * @param {Object} action action object
 * @param {Number} action.siteId site identifier
 * @param {Number} action.postId post identifier
 * @param {Function|Object} updaterOrValue an updater function or a value
 * @returns {Immutable.Map} new state
 */
function updateSpecificState( state, action, updaterOrValue ) {
	const id = getCommentParentKey( action.siteId, action.postId );

	if ( typeof updaterOrValue === 'function' ) {
		return state.update( id, ( value ) => updaterOrValue( value ) );
	}

	return state.set( id, updaterOrValue );
}

/***
 * Comments items reducer, stores a comments items Immutable.List per siteId, postId
 * @param {Immutable.Map} state redux state
 * @param {Object} action redux action
 * @returns {Immutable.Map} new redux state
 */
export function items( state = Immutable.Map(), action ) {
	switch ( action.type ) {
		case COMMENTS_RECEIVE:
			// create set of ids for faster lookup for filter later
			const newIds = Immutable.Set( action.comments.map( comment => comment.ID ) );

			// we prefer freshly retrieved data, so throw away old data
			return updateSpecificState( state, action, function( comments = Immutable.List() ) {
				let newComments = comments.filter( ( comment ) => ! newIds.has( comment.get( 'ID' ) ) )
											.concat( Immutable.fromJS( action.comments ) );

				if ( ! action.skipSort ) {
					newComments = newComments.sort( ( a, b ) => new Date( b.get( 'date' ) ) - new Date( a.get( 'date' ) ) );
				}

				return newComments;
			} );

		case COMMENTS_REMOVE:
			return updateSpecificState( state, action, ( comments = Immutable.List() ) =>
				comments.filter( ( comment ) => comment.get( 'ID' ) !== action.commentId )
			);
		case COMMENTS_LIKE:
			return updateSpecificState( state, action, ( comments = Immutable.List() ) =>
				updateExistingIn( comments,
					( comment ) => comment.get( 'ID' ) === action.commentId,
					getLikeSetter( { like: true } )
				)
			);
		case COMMENTS_LIKE_UPDATE:
			return updateSpecificState( state, action, ( comments = Immutable.List() ) =>
				updateExistingIn( comments,
					( comment ) => comment.get( 'ID' ) === action.commentId,
					getLikeSetter( { like: action.iLike, likeCount: action.likeCount } )
				)
			);
		case COMMENTS_UNLIKE:
			return updateSpecificState( state, action, ( comments = Immutable.List() ) =>
				updateExistingIn( comments,
					( comment ) => comment.get( 'ID' ) === action.commentId,
					getLikeSetter( { like: false } )
				)
			);
		case COMMENTS_ERROR:
			return updateSpecificState( state, action, ( comments = Immutable.List() ) =>
				updateExistingIn( comments,
					( comment ) => comment.get( 'ID' ) === action.commentId,
					( comment ) => comment.set( 'placeholderState', PLACEHOLDER_STATE.ERROR )
										.set( 'placeholderError', action.error )
				)
			);
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return Immutable.Map();
	}

	return state;
}

/***
 * Stores information regarding requests status per requestId
 * @param {Immutable.Map} state redux state
 * @param {Object} action redux action
 * @returns {Immutable.Map} new redux state
 */
export function requests( state = Immutable.Map(), action ) {
	switch ( action.type ) {
		case COMMENTS_REQUEST:
		case COMMENTS_REQUEST_SUCCESS:
		case COMMENTS_REQUEST_FAILURE:
			return updateSpecificState(
				state,
				action,
				( requestStatuses = Immutable.Map() ) => requestStatuses.set( action.requestId, action.type )
			);
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return Immutable.Map();
	}

	return state;
}

/***
 * Stores latest comments count for post we've seen from the server
 * @param {Immutable.Map} state redux state, prev totalCommentsCount
 * @param {Object} action redux action
 * @returns {Immutable.Map} new redux state
 */
export function totalCommentsCount( state = Immutable.Map(), action ) {
	switch ( action.type ) {
		case COMMENTS_COUNT_RECEIVE:
			return updateSpecificState( state, action, action.totalCommentsCount );
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return Immutable.Map();
	}

	return state;
}

export default combineReducers( {
	items,
	requests,
	totalCommentsCount
} );
