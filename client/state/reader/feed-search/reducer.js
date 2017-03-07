/**
 * External dependencies
 */
import { createReducer } from 'redux';

/**
 * Internal dependencies
 */
import { READER_FEED_SEARCH_RECIEVE } from 'state/action-types';

/**
 * Tracks mappings between queries --> feed results
 * Here is what the state tree may look like:
 * feedsearch: {
		items: {
			'wordpress tavern': [ feed1, feed2, ],
			...
		},
	}
/**
 * Tracks all known feeds, indexed by iframe.query
 *
 * @param  {Array} state  Current state
 * @param  {Object} action Action payload
 * @return {Array}        Updated state
 */
export const items = createReducer( {}, {
	[ READER_FEED_SEARCH_RECIEVE ]: ( state, action ) => ( {
		...state,
		[ action.payload.query ]: ( state[ action.payload.query ] || [] ).concat( action.payload.feeds ),
	} )
} );

export default items;
