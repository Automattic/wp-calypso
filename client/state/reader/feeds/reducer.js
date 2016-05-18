import { combineReducers } from 'redux';
import assign from 'lodash/assign';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import omit from 'lodash/omit';
import omitBy from 'lodash/omitBy';

import {
	READER_FEED_REQUEST,
	READER_FEED_REQUEST_SUCCESS,
	READER_FEED_REQUEST_FAILURE,
	READER_FEED_UPDATE,
	DESERIALIZE,
	SERIALIZE
} from 'state/action-types';

import { decodeEntities } from 'lib/formatting';

import { isValidStateWithSchema } from 'state/utils';
import { itemsSchema } from './schema';

const actionMap = {
	[ SERIALIZE ]: handleSerialize,
	[ DESERIALIZE ]: handleDeserialize,
	[ READER_FEED_REQUEST_SUCCESS ]: handleRequestSuccess,
	[ READER_FEED_REQUEST_FAILURE ]: handleRequestFailure,
	[ READER_FEED_UPDATE ]: handleFeedUpdate
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
	return assign( {
		[ action.payload.feed_ID ]: {
			feed_ID: action.payload.feed_ID,
			is_error: true
		}
	}, state );
}

function handleRequestSuccess( state, action ) {
	const feed = assign( {}, action.payload );
	if ( feed.name ) {
		feed.name = decodeEntities( feed.name );
	}
	return assign( {}, state, {
		[ action.payload.feed_ID ]: feed
	} );
}

function handleFeedUpdate( state, action ) {
	const feeds = map( action.payload, feed => {
		feed = assign( {}, feed );
		if ( feed.name ) {
			feed.name = decodeEntities( feed.name );
		}
		return feed;
	} );
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
				[ action.payload.feed_ID ]: true
			} );
			break;
		case READER_FEED_REQUEST_SUCCESS:
		case READER_FEED_REQUEST_FAILURE:
			return omit( state, action.payload.feed_ID );
			break;
	}
	return state;
}

export default combineReducers( {
	items,
	queuedRequests
} );
