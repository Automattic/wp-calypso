/** @format */
/**
 * External dependencies
 */
import { assign, keyBy, map, omit, omitBy, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { itemsSchema } from './schema';
import { decodeEntities } from 'lib/formatting';
import { READER_FEED_REQUEST, READER_FEED_REQUEST_SUCCESS, READER_FEED_REQUEST_FAILURE, READER_FEED_UPDATE, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { combineReducers, createReducer, isValidStateWithSchema } from 'state/utils';

const actionMap = {
	[ SERIALIZE ]: handleSerialize,
	[ DESERIALIZE ]: handleDeserialize,
	[ READER_FEED_REQUEST_SUCCESS ]: handleRequestSuccess,
	[ READER_FEED_REQUEST_FAILURE ]: handleRequestFailure,
	[ READER_FEED_UPDATE ]: handleFeedUpdate,
};

function defaultHandler( state ) {
	return state;
}

function handleSerialize( state ) {
	// remove errors from the serialized state
	return omitBy( state, 'is_error' );
}

function handleDeserialize( state ) {
	if ( isValidStateWithSchema( state, itemsSchema ) ) {
		return state;
	}
	return {};
}

function handleRequestFailure( state, action ) {
	// new object proceeds current state to prevent new errors from overwriting existing values
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
		URL: feed.URL,
		feed_URL: feed.feed_URL,
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

export function items( state = {}, action ) {
	const handler = actionMap[ action.type ] || defaultHandler;
	return handler( state, action );
}

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
