/**
 * External Dependencies
 */
import { assign, keyBy, map, omit, omitBy, reduce, merge, forEach } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	READER_FEED_REQUEST,
	READER_FEED_REQUEST_SUCCESS,
	READER_FEED_REQUEST_FAILURE,
	READER_FEED_UPDATE,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
	READER_SEEN_MARK_ALL_AS_SEEN_RECEIVE,
} from 'calypso/state/reader/action-types';
import { SERIALIZE } from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { itemsSchema } from './schema';
import { safeLink } from 'calypso/lib/post-normalizer/utils';

function handleSerialize( state ) {
	// remove errors from the serialized state
	return omitBy( state, 'is_error' );
}

function handleRequestFailure( state, action ) {
	// new object precedes current state to prevent new errors from overwriting existing values
	return assign(
		{
			[ action.payload.feed_ID ]: {
				feed_ID: action.payload.feed_ID,
				is_error: true,
			},
		},
		state
	);
}

function adaptFeed( feed ) {
	return {
		feed_ID: +feed.feed_ID,
		blog_ID: +feed.blog_ID,
		name: feed.name && decodeEntities( feed.name ),
		URL: safeLink( feed.URL ),
		feed_URL: safeLink( feed.feed_URL ),
		is_following: feed.is_following,
		subscribers_count: feed.subscribers_count,
		description: feed.description && decodeEntities( stripHTML( feed.description ) ),
		last_update: feed.last_update,
		image: feed.image,
		organization_id: feed.organization_id,
		unseen_count: feed.unseen_count,
	};
}

function handleRequestSuccess( state, action ) {
	const feed = adaptFeed( action.payload );
	return assign( {}, state, {
		[ feed.feed_ID ]: feed,
	} );
}

function handleFeedUpdate( state, action ) {
	const feeds = map( action.payload, adaptFeed );
	return assign( {}, state, keyBy( feeds, 'feed_ID' ) );
}

export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
			return handleSerialize( state, action );
		case READER_FEED_REQUEST_SUCCESS:
			return handleRequestSuccess( state, action );
		case READER_FEED_REQUEST_FAILURE:
			return handleRequestFailure( state, action );
		case READER_FEED_UPDATE:
			return handleFeedUpdate( state, action );

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
} );

export function queuedRequests( state = {}, action ) {
	switch ( action.type ) {
		case READER_FEED_REQUEST:
			return assign( {}, state, {
				[ action.payload.feed_ID ]: true,
			} );

		case READER_FEED_REQUEST_SUCCESS:
		case READER_FEED_REQUEST_FAILURE:
			return omit( state, action.payload.feed_ID );
	}
	return state;
}

export const lastFetched = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_FEED_REQUEST_SUCCESS:
			return {
				...state,
				[ action.payload.feed_ID ]: Date.now(),
			};
		case READER_FEED_UPDATE: {
			const updates = reduce(
				action.payload,
				( memo, feed ) => {
					memo[ feed.feed_ID ] = Date.now();
					return memo;
				},
				{}
			);
			return assign( {}, state, updates );
		}
	}

	return state;
} );

export default combineReducers( {
	items,
	lastFetched,
	queuedRequests,
} );
