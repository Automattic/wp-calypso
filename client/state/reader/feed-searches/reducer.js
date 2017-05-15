/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
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
export const items = createReducer(
	{},
	{
		[ READER_FEED_SEARCH_RECEIVE ]: ( state, action ) => {
			const current = state[ action.query ] || [];
			return {
				...state,
				[ action.query ]: uniqBy( current.concat( action.payload.feeds ), 'feed_URL' ),
			};
		},
	}
);

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
export const total = createReducer(
	{},
	{
		[ READER_FEED_SEARCH_RECEIVE ]: ( state, action ) => ( {
			...state,
			[ action.query ]: action.payload.total,
		} ),
	}
);

export default combineReducers( {
	items,
	total,
} );
