/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, keyedReducer } from 'state/utils';
import { READER_FEED_SEARCH_RECEIVE } from 'state/action-types';

/**
 * Tracks mappings between queries --> feed results
 * Here is what the state tree may look like:
 * feedSearches: {
		items: {
			'wordpress tavern': [ feed1, feed2, ],
			...
		},
	}
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export const items = keyedReducer( 'query', createReducer( null, {
	[ READER_FEED_SEARCH_RECEIVE ]: ( state, action ) => uniqBy(
		( state || [] ).concat( action.payload.feeds ),
		'feed_URL',
	)
} ) );

/**
 * Tracks mappings between queries --> num results
 * Here is what the state tree may look like:
 * feedSearches: {
		total: {
			'wordpress tavern': 4,
			'thingsldkjflskjfsdf': 0,
			'chickens': 4000,
			...
		},
	}
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action Action payload
 * @return {Array}         Updated state
 */
export const total = keyedReducer( 'query', createReducer( null, {
	[ READER_FEED_SEARCH_RECEIVE ]: ( state, action ) => action.payload.total
} ) );

export default combineReducers( {
	items,
	total,
} );
