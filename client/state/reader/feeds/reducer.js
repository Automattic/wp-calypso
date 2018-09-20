/** @format */
/**
 * External Dependencies
 */
import { assign, keyBy, map, omit, omitBy, reduce } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	READER_FEED_REQUEST,
	READER_FEED_REQUEST_SUCCESS,
	READER_FEED_REQUEST_FAILURE,
	READER_FEED_UPDATE,
	SERIALIZE,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
import { decodeEntities } from 'lib/formatting';
import { itemsSchema } from './schema';
import { safeLink } from 'lib/post-normalizer/utils';

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
		description: feed.description && decodeEntities( feed.description ),
		last_update: feed.last_update,
		image: feed.image,
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

export const items = createReducer(
	{},
	{
		[ SERIALIZE ]: handleSerialize,
		[ READER_FEED_REQUEST_SUCCESS ]: handleRequestSuccess,
		[ READER_FEED_REQUEST_FAILURE ]: handleRequestFailure,
		[ READER_FEED_UPDATE ]: handleFeedUpdate,
	},
	itemsSchema
);

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

export const lastFetched = createReducer(
	{},
	{
		[ READER_FEED_REQUEST_SUCCESS ]: ( state, action ) => ( {
			...state,
			[ action.payload.feed_ID ]: Date.now(),
		} ),
		[ READER_FEED_UPDATE ]: ( state, action ) => {
			const updates = reduce(
				action.payload,
				( memo, feed ) => {
					memo[ feed.feed_ID ] = Date.now();
					return memo;
				},
				{}
			);
			return assign( {}, state, updates );
		},
	}
);

export default combineReducers( {
	items,
	lastFetched,
	queuedRequests,
} );
