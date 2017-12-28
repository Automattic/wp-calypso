/** @format */

/**
 * Internal dependencies
 */

import queryKey from 'client/state/reader/feed-searches/query-key';

/**
 * Returns the number of feed results for a given query. from 0 to 200.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  query query
 * @return {Array} list of feeds that are the result of that query
 */
export default function getReaderFeedsCountForQuery( state, query ) {
	const key = queryKey( query );
	return state.reader.feedSearches.total[ key ];
}
