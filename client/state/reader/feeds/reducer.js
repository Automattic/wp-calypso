import { omit, omitBy, merge, forEach } from 'lodash';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { safeLink } from 'calypso/lib/post-normalizer/utils';
import {
	READER_FEED_REQUEST,
	READER_FEED_REQUEST_SUCCESS,
	READER_FEED_REQUEST_FAILURE,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
} from 'calypso/state/reader/action-types';
import { combineReducers, withSchemaValidation, withPersistence } from 'calypso/state/utils';
import { itemsSchema } from './schema';

function handleRequestFailure( state, action ) {
	// new object precedes current state to prevent new errors from overwriting existing values
	return {
		[ action.payload.feed_ID ]: {
			feed_ID: action.payload.feed_ID,
			is_error: true,
		},
		...state,
	};
}

function adaptFeed( feed ) {
	// Preserve the original feed URL for follow button functionality
	// Try multiple sources: URL, feed_URL, subscribe_URL
	// This may still be undefined if the API doesn't provide any URL, but that's expected
	const originalUrl = feed.URL || feed.feed_URL || feed.subscribe_URL;

	return {
		feed_ID: +feed.feed_ID,
		blog_ID: +feed.blog_ID,
		name: feed.name && decodeEntities( feed.name ),
		URL: safeLink( feed.URL ),
		feed_URL: safeLink( feed.feed_URL ),
		// Store original URL even if it doesn't pass safeLink validation
		// This ensures the subscribe button can always render
		unsanitized_URL: originalUrl,
		blog_owner: feed.blog_owner,
		is_following: feed.is_following,
		subscribers_count: feed.subscribers_count,
		description: feed.description && decodeEntities( stripHTML( feed.description ) ),
		last_update: feed.last_update,
		image: feed.image,
		organization_id: feed.organization_id,
		unseen_count: feed.unseen_count,
		subscription_id: feed.subscription_id,
	};
}

function handleRequestSuccess( state, action ) {
	const feed = adaptFeed( action.payload );
	return {
		...state,
		[ feed.feed_ID ]: feed,
	};
}

const itemsReducer = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_FEED_REQUEST_SUCCESS:
			return handleRequestSuccess( state, action );
		case READER_FEED_REQUEST_FAILURE:
			return handleRequestFailure( state, action );

		case READER_SEEN_MARK_AS_SEEN_RECEIVE: {
			const existingEntry = state[ action.feedId ];
			if ( ! existingEntry ) {
				return state;
			}

			return {
				...state,
				[ action.feedId ]: merge( {}, existingEntry, {
					unseen_count: Math.max( existingEntry.unseen_count - action.globalIds.length, 0 ),
				} ),
			};
		}

		case READER_SEEN_MARK_AS_UNSEEN_RECEIVE: {
			const existingEntry = state[ action.feedId ];
			if ( ! existingEntry ) {
				return state;
			}

			return {
				...state,
				[ action.feedId ]: merge( {}, existingEntry, {
					unseen_count: Math.max( existingEntry.unseen_count + action.globalIds.length, 0 ),
				} ),
			};
		}

		case READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE: {
			forEach( action.feedIds, ( feedId ) => {
				state[ feedId ] = { ...state[ feedId ], unseen_count: 0 };
			} );
			return { ...state };
		}
	}

	return state;
};

export const items = withSchemaValidation(
	itemsSchema,
	withPersistence( itemsReducer, {
		// remove errors from the serialized state
		serialize: ( state ) => omitBy( state, 'is_error' ),
		// Migrate old feed objects that don't have unsanitized_URL
		deserialize: ( persisted ) => {
			if ( ! persisted || typeof persisted !== 'object' ) {
				return persisted;
			}
			// Add unsanitized_URL to feeds that don't have it (for backward compatibility)
			const migrated = {};
			Object.keys( persisted ).forEach( ( feedId ) => {
				const feed = persisted[ feedId ];
				if ( feed && ! feed.unsanitized_URL && ( feed.URL || feed.feed_URL ) ) {
					// Reconstruct unsanitized_URL from available URLs
					migrated[ feedId ] = {
						...feed,
						unsanitized_URL: feed.URL || feed.feed_URL,
					};
				} else {
					migrated[ feedId ] = feed;
				}
			} );
			return migrated;
		},
	} )
);

export function queuedRequests( state = {}, action ) {
	switch ( action.type ) {
		case READER_FEED_REQUEST:
			return {
				...state,
				[ action.payload.feed_ID ]: true,
			};

		case READER_FEED_REQUEST_SUCCESS:
		case READER_FEED_REQUEST_FAILURE:
			return omit( state, action.payload.feed_ID );
	}
	return state;
}

export const lastFetched = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_FEED_REQUEST_SUCCESS:
			return {
				...state,
				[ action.payload.feed_ID ]: Date.now(),
			};
	}

	return state;
};

export default combineReducers( {
	items,
	lastFetched,
	queuedRequests,
} );
