/**
 * External dependencies
 */
import { uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, withoutPersistence } from 'calypso/state/utils';
import { READER_FEED_SEARCH_RECEIVE } from 'calypso/state/reader/action-types';

/**
 * Tracks mappings between queries --> feed results
 *
 * A map of query to results, keyed by query key.
 * The query key is supplied by the action, making it opaque to the reducer.
 * Here is what the state tree may look like:
 * feedSearches: {
		items: {
			'wordpress tavern-X': [ feed1, feed2, ],
			...
		},
	}
 *
 * @param  {Array} state  Current state
 * @param  {object} action Action payload
 * @returns {Array}        Updated state
 */
export const items = keyedReducer(
	'queryKey',
	withoutPersistence( ( state = null, action ) => {
		switch ( action.type ) {
			case READER_FEED_SEARCH_RECEIVE:
				return uniqBy( ( state || [] ).concat( action.payload.feeds ), 'feed_URL' );
		}

		return state;
	} )
);

/**
 * Tracks mappings between queries --> num results
 *
 * A of query counts to results, keyed by query key.
 * The query key is supplied by the action, making it opaque to the reducer.
 * Here is what the state tree may look like:
 * feedSearches: {
		total: {
			'wordpress tavern-X': 4,
			'thingsldkjflskjfsdf-A': 0,
			'chickens-A': 4000,
			...
		},
	}
 *
 * @param  {Array}  state  Current state
 * @param  {object} action Action payload
 * @returns {Array}         Updated state
 */
export const total = keyedReducer(
	'queryKey',
	withoutPersistence( ( state = null, action ) => {
		switch ( action.type ) {
			case READER_FEED_SEARCH_RECEIVE:
				return action.payload.total;
		}

		return state;
	} )
);

export default combineReducers( {
	items,
	total,
} );
