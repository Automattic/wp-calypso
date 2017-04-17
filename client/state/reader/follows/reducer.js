/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { find, get, isEqual, merge, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
	READER_SUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION,
	READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL,
} from 'state/action-types';
import { prepareComparableUrl } from './utils';
import { createReducer } from 'state/utils';

function updatePostSubscription( state, { payload, type } ) {
	const follow = find( state, { blog_ID: +payload.blogId } );
	if ( ! follow ) {
		return state;
	}

	const currentFollowState = get( follow, [ 'delivery_methods', 'email' ], {} );

	const newProps = {
		send_posts: ! ( type === READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL )
	};

	if ( payload.deliveryFrequency ) {
		newProps.post_delivery_frequency = payload.deliveryFrequency;
	}

	const newFollowState = {
		...currentFollowState,
		...newProps,
	};

	if ( isEqual( currentFollowState, newFollowState ) ) {
		return state;
	}

	return {
		...state,
		[ prepareComparableUrl( follow.URL ) ]: {
			...follow,
			delivery_methods: {
				email: newFollowState
			}
		}
	};
}

/**
 * Updates a comment subscription
 *
 * @param {object} state the current state
 * @param {integer} blogId The blog to update the comment subscription for
 * @param {boolean} value the new value to set
 * @returns {object} the next state
 */
function updateCommentSubscription( state, blogId, value ) {
	const follow = find( state, { blog_ID: +blogId } );
	if ( ! follow ) {
		return state;
	}

	if ( get( follow, [ 'delivery_methods', 'email', 'send_comments' ], ! value ) === value ) {
		return state;
	}

	return {
		...state,
		[ prepareComparableUrl( follow.URL ) ]: {
			...follow,
			delivery_methods: {
				email: {
					...get( follow, [ 'delivery_methods', 'email' ], {} ),
					send_comments: value
				}
			}
		}
	};
}

/**
 * Tracks all known list objects, indexed by list ID.
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export const items = createReducer( {}, {
	[ READER_FOLLOW ]: ( state, action ) => {
		const urlKey = prepareComparableUrl( action.payload.url );
		return {
			...state,
			[ urlKey ]: merge( {}, state[ urlKey ], { is_following: true } ),
		};
	},
	[ READER_UNFOLLOW ]: ( state, action ) => {
		const urlKey = prepareComparableUrl( action.payload.url );
		return {
			...state,
			[ urlKey ]: merge( {}, state[ urlKey ], { is_following: false } ),
		};
	},
	[ READER_FOLLOWS_RECEIVE ]: ( state, action ) => {
		const follows = action.payload.follows;
		const keyedNewFollows = reduce( follows, ( hash, follow ) => {
			const urlKey = prepareComparableUrl( follow.URL );
			const newFollow = {
				...follow,
				is_following: true
			};
			hash[ urlKey ] = newFollow;
			return hash;
		}, {} );
		return merge( {}, state, keyedNewFollows );
	},
	[ READER_SUBSCRIBE_TO_NEW_POST_EMAIL ]: ( state, action ) => updatePostSubscription(
		state,
		action,
		),
	[ READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION ]: ( state, action ) => updatePostSubscription(
		state,
		action,
		),
	[ READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL ]: ( state, action ) => updatePostSubscription(
		state,
		action,
		),
	[ READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: ( state, { payload: { blogId } } ) => updateCommentSubscription( state, blogId, true ),
	[ READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: ( state, { payload: { blogId } } ) => updateCommentSubscription( state, blogId, false ),
} );

export default combineReducers( {
	items
} );
