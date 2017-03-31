/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { find, get, merge, reduce } from 'lodash';

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

function updatePostSubscription( state, payload, shouldSkipUpdate, newProps ) {
	const follow = find( state, item => item.blog_ID == payload.blogId ); //eslint-disable-line eqeqeq
	if ( ! follow ) {
		return state;
	}

	if ( shouldSkipUpdate( follow, payload ) ) {
		return state;
	}

	return {
		...state,
		[ prepareComparableUrl( follow.URL ) ]: {
			...follow,
			delivery_methods: {
				email: {
					...get( follow, [ 'delivery_methods', 'email' ], {} ),
					newProps
				}
			}
		}
	};
}

function skipNewPostSubscription( current, next ) {
	return get( current, [ 'delivery_methods', 'email', 'send_posts' ], false ) &&
			get( current, [ 'delivery_methods', 'email', 'post_delivery_frequency' ] ) === next.deliveryFrequency;
}

function skipUpdatePostSubscription( current, next ) {
	return get( current, [ 'delivery_methods', 'email', 'post_delivery_frequency' ] ) === next.deliveryFrequency;
}

function skipPostUnsubscription( current ) {
	return get( current, [ 'delivery_methods', 'email', 'send_posts' ], true ) === false;
}

function updateCommentSubscription( state, blogId, value ) {
	const follow = find( state, item => item.blog_ID == blogId ); //eslint-disable-line eqeqeq
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
	[ READER_SUBSCRIBE_TO_NEW_POST_EMAIL ]: ( state, { payload } ) => updatePostSubscription(
		state,
		payload,
		skipNewPostSubscription,
		{
			send_posts: true,
			post_delivery_frequency: payload.deliveryFrequency
		},
		),
	[ READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION ]: ( state, { payload } ) => updatePostSubscription(
		state,
		payload,
		skipUpdatePostSubscription,
		{ post_delivery_frequency: payload.deliveryFrequency },
		),
	[ READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL ]: ( state, { payload } ) => updatePostSubscription(
		state,
		payload,
		skipPostUnsubscription,
		{ send_posts: false },
		),
	[ READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: ( state, { payload: { blogId } } ) => updateCommentSubscription( state, blogId, true ),
	[ READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: ( state, { payload: { blogId } } ) => updateCommentSubscription( state, blogId, false ),
} );

export default combineReducers( {
	items
} );
