/** @format */
/**
 * External dependencies
 */
import { uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_FEED_SEARCH_RECEIVE } from 'state/action-types';
import { combineReducers, createReducer, keyedReducer } from 'state/utils';

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
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export const items = keyedReducer(
	'queryKey',
	createReducer( null, {
		[ READER_FEED_SEARCH_RECEIVE ]: ( state, action ) =>
			uniqBy( ( state || [] ).concat( action.payload.feeds ), 'feed_URL' ),
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
 * @param  {Object} action Action payload
 * @return {Array}         Updated state
 */
export const total = keyedReducer(
	'queryKey',
	createReducer( null, {
		[ READER_FEED_SEARCH_RECEIVE ]: ( state, action ) => action.payload.total,
	} )
);

export default combineReducers( {
	items,
	total,
} );
