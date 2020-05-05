/**
 * External dependencies
 */
import { find, get, isEqual, merge, omitBy, pickBy, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
	READER_FOLLOW_ERROR,
	READER_RECORD_FOLLOW,
	READER_RECORD_UNFOLLOW,
	READER_FOLLOWS_SYNC_START,
	READER_FOLLOWS_SYNC_COMPLETE,
	READER_FOLLOWS_RECEIVE,
	READER_SITE_REQUEST_SUCCESS,
	READER_SUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION,
	READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
	READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
} from 'state/reader/action-types';
import { SERIALIZE } from 'state/action-types';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'state/utils';
import { prepareComparableUrl } from './utils';
import { items as itemsSchema } from './schema';

function updateEmailSubscription( state, { payload, type } ) {
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
				email: newFollowState,
				notification: get( follow, [ 'delivery_methods', 'notification' ], {} ),
			},
		},
	};
}

function updateNotificationSubscription( state, { payload, type } ) {
	const follow = find( state, { blog_ID: +payload.blogId } );
	if ( ! follow ) {
		return state;
	}

	const currentFollowState = get(
		follow,
		[ 'delivery_methods', 'notification', 'send_posts' ],
		false
	);

	const newFollowState = ! ( type === READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS );

	if ( currentFollowState === newFollowState ) {
		return state;
	}

	return {
		...state,
		[ prepareComparableUrl( follow.URL ) ]: {
			...follow,
			delivery_methods: {
				email: get( follow, [ 'delivery_methods', 'email' ], {} ),
				notification: {
					send_posts: newFollowState,
				},
			},
		},
	};
}

export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_RECORD_FOLLOW: {
			const urlKey = prepareComparableUrl( action.payload.url );
			return {
				...state,
				[ urlKey ]: merge( {}, state[ urlKey ], { is_following: true } ),
			};
		}
		case READER_RECORD_UNFOLLOW: {
			const urlKey = prepareComparableUrl( action.payload.url );
			return {
				...state,
				[ urlKey ]: merge( {}, state[ urlKey ], { is_following: false } ),
			};
		}
		case READER_FOLLOW_ERROR: {
			const urlKey = prepareComparableUrl( action.payload.feedUrl );
			return {
				...state,
				[ urlKey ]: merge( {}, state[ urlKey ], { error: action.payload.error } ),
			};
		}
		case READER_FOLLOW: {
			let urlKey = prepareComparableUrl( action.payload.feedUrl );
			const newValues = { is_following: true };

			const actualFeedUrl = get( action.payload, [ 'follow', 'feed_URL' ], action.payload.feedUrl );

			const newState = { ...state };
			// for the case where a user entered an exact url to follow something, sometimes the
			// correct feed_URL is slightly different from what they typed in.
			// e.g. example.com --> example.com/rss.
			// Since we are keying this reducer by url,
			// we need delete the old key and move it to the new one.
			// also keep what was typed in as an alias.  pretty edge casey but ideally we should retain aliases to
			// display correct followByUrl follow button status
			if ( actualFeedUrl !== action.payload.feedUrl ) {
				newValues.alias_feed_URLs = [
					...( state[ urlKey ].alias_feed_URLs || [] ),
					prepareComparableUrl( action.payload.feedUrl ),
				];
				delete newState[ urlKey ];
				urlKey = prepareComparableUrl( actualFeedUrl );
			} else if ( state[ urlKey ] && state[ urlKey ].error ) {
				// Reset follow error state
				newValues.error = null;
			}

			// Respect the existing state of the new post notification toggle.
			// User may have toggled it on immediately after subscribing and
			// action.payload.follow may overwrite it with the old value
			const existingNotificationState = get( state[ urlKey ], [
				'delivery_methods',
				'notification',
			] );
			if ( existingNotificationState ) {
				newValues.delivery_methods = {
					notification: existingNotificationState,
				};
			}

			return Object.assign( newState, {
				[ urlKey ]: merge(
					{ feed_URL: actualFeedUrl },
					state[ urlKey ],
					action.payload.follow,
					newValues
				),
			} );
		}
		case READER_UNFOLLOW: {
			const urlKey = prepareComparableUrl( action.payload.feedUrl );
			const currentFollow = state[ urlKey ];
			if ( ! ( currentFollow && currentFollow.is_following ) ) {
				return state;
			}

			return {
				...state,
				[ urlKey ]: merge( {}, currentFollow, {
					is_following: false,
					delivery_methods: {
						notification: { send_posts: false },
					},
				} ),
			};
		}
		case READER_FOLLOWS_RECEIVE: {
			const follows = action.payload.follows;
			const keyedNewFollows = reduce(
				follows,
				( hash, follow ) => {
					const urlKey = prepareComparableUrl( follow.URL );
					const newFollow = {
						...follow,
						is_following: true,
					};
					hash[ urlKey ] = newFollow;
					return hash;
				},
				{}
			);
			return merge( {}, state, keyedNewFollows );
		}
		case READER_SITE_REQUEST_SUCCESS: {
			const incomingSite = action.payload;
			if ( ! incomingSite || ! incomingSite.feed_URL || ! incomingSite.is_following ) {
				return state;
			}
			const urlKey = prepareComparableUrl( incomingSite.feed_URL );
			const currentFollow = state[ urlKey ];
			const newFollow = {
				delivery_methods: get( incomingSite, 'subscription.delivery_methods' ),
				is_following: true,
				URL: incomingSite.URL,
				feed_URL: incomingSite.feed_URL,
				blog_ID: incomingSite.ID,
			};
			return {
				...state,
				[ urlKey ]: merge( {}, currentFollow, newFollow ),
			};
		}
		case READER_SUBSCRIBE_TO_NEW_POST_EMAIL:
			return updateEmailSubscription( state, action );
		case READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION:
			return updateEmailSubscription( state, action );
		case READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL:
			return updateEmailSubscription( state, action );
		case READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL:
			return updateEmailSubscription( state, action );
		case READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL:
			return updateEmailSubscription( state, action );
		case READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS:
			return updateNotificationSubscription( state, action );
		case READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS:
			return updateNotificationSubscription( state, action );
		case READER_FOLLOWS_SYNC_COMPLETE: {
			const seenSubscriptions = new Set( action.payload );

			// diff what we saw vs. what's in state and remove anything extra
			// extra would be active subscriptions that were not seen in the sync
			//
			// Only check items with an ID (the subscription ID) because those are what
			// we show on the manage listing. Items without an ID are either inflight follows
			// or follows that we picked up from a feed, site, or post object.
			return omitBy( state, ( follow ) => follow.ID && ! seenSubscriptions.has( follow.feed_URL ) );
		}
		case SERIALIZE:
			return pickBy( state, ( item ) => item.ID && item.is_following );
	}

	return state;
} );

export const itemsCount = withoutPersistence( ( state = 0, action ) => {
	switch ( action.type ) {
		case READER_FOLLOWS_RECEIVE: {
			return action.payload.totalCount ? action.payload.totalCount : state;
		}
	}

	return state;
} );

export const lastSyncTime = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case READER_FOLLOWS_SYNC_START: {
			return Date.now();
		}
	}

	return state;
} );

export default combineReducers( {
	items,
	itemsCount,
	lastSyncTime,
} );
