/** @format */

/**
 * Internal dependencies
 */

import queryKey from 'client/state/reader/feed-searches/query-key';

/**
 * Returns the feeds result for a given query.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  query query
 * @return {Array} list of feeds that are the result of that query
 */
export default function getReaderFeedsForQuery( state, query ) {
	const key = queryKey( query );
	return state.reader.feedSearches.items[ key ];
}
