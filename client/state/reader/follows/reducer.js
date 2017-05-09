/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { find, get, isEqual, merge, pickBy, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
	READER_RECORD_FOLLOW,
	READER_RECORD_UNFOLLOW,
	READER_FOLLOWS_SYNC_START,
	READER_FOLLOWS_RECEIVE,
	READER_SUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION,
	READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	SERIALIZE,
} from 'state/action-types';
import { prepareComparableUrl } from './utils';
import { items as itemsSchema } from './schema';
import { createReducer } from 'state/utils';

function updatePostSubscription( state, { payload, type } ) {
	const follow = find( state, { blog_ID: +payload.blogId } );
	if ( ! follow ) {
		return state;
	}

	const currentFollowState = get( follow, [ 'delivery_methods', 'email' ], {} );

	const newProps = {};
	switch ( type ) {
		case READER_SUBSCRIBE_TO_NEW_POST_EMAIL:
		case READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL:
			newProps.send_posts = ! ( type === READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL );
			break;
		case READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL:
		case READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL:
			newProps.send_comments = ! ( type === READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL );
			break;
	}

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

export const items = createReducer( {}, {
	[ READER_RECORD_FOLLOW ]: ( state, action ) => {
		const urlKey = prepareComparableUrl( action.payload.url );
		return {
			...state,
			[ urlKey ]: merge( {}, state[ urlKey ], { is_following: true } ),
		};
	},
	[ READER_RECORD_UNFOLLOW ]: ( state, action ) => {
		const urlKey = prepareComparableUrl( action.payload.url );
		return {
			...state,
			[ urlKey ]: merge( {}, state[ urlKey ], { is_following: false } ),
		};
	},
	[ READER_FOLLOW ]: ( state, action ) => {
		const urlKey = prepareComparableUrl( action.payload.feedUrl );
		return {
			...state,
			[ urlKey ]: merge(
				{ feed_URL: action.payload.feedUrl },
				state[ urlKey ],
				action.payload.follow,
				{ is_following: true }
			)
		};
	},
	[ READER_UNFOLLOW ]: ( state, action ) => {
		const urlKey = prepareComparableUrl( action.payload.feedUrl );
		const currentFollow = state[ urlKey ];
		if ( ! ( currentFollow && currentFollow.is_following ) ) {
			return state;
		}
		return {
			...state,
			[ urlKey ]: merge(
				{},
				currentFollow,
				{ is_following: false }
			)
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
	[ READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION ]: ( state, action ) => updatePostSubscription( state, action ),
	[ READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL ]: ( state, action ) => updatePostSubscription( state, action ),
	[ READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: ( state, action ) => updatePostSubscription( state, action ),
	[ READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: ( state, action ) => updatePostSubscription( state, action ),
	[ SERIALIZE ]: ( state ) => pickBy( state, item => item.is_following ),
}, itemsSchema );

export const itemsCount = createReducer( 0, {
	[ READER_FOLLOWS_RECEIVE ]: ( state, action ) => {
		return !! action.payload.totalCount
			? action.payload.totalCount
			: state;
	}
} );

export const lastSyncTime = createReducer( null, {
	[ READER_FOLLOWS_SYNC_START ]: ( ) => {
		return Date.now();
	}
} );

export default combineReducers( {
	items,
	itemsCount,
	lastSyncTime
} );
