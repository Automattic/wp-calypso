/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_FEED_SEARCH_REQUEST,
	READER_FEED_SEARCH_FAILURE,
	READER_FEED_SEARCH_SUCCESS,
	READER_FEED_SEARCH_RECIEVE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';

/**
 * Tracks mappings between queries --> feed results
 * Here is what the state tree may look like:
 * feedsearch: {
		items: {
			'wordpress tavern': [ feed1, feed2, ],
			...
		},
		requesting: {
			'wordpress tavern': false,
			...
		}
	}

/**
 * Tracks all known feeds, indexed by iframe.query
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case READER_FEED_SEARCH_RECIEVE:
			return {
				...state,
				[ action.query ]: action.feeds,
			};

		// Always return default state - we don't want to serialize feeds
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export function requesting( state = {}, action ) {
	switch ( action.type ) {
		case READER_FEED_SEARCH_REQUEST:
		case READER_FEED_SEARCH_SUCCESS:
		case READER_FEED_SEARCH_FAILURE:
			return {
				...state,
				[ action.query ]: action.type === READER_FEED_SEARCH_SUCCESS
			};
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	items,
	requesting
} );
