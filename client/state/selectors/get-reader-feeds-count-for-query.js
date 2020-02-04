/**
 * Internal dependencies
 */
import queryKey from 'state/reader/feed-searches/query-key';

import 'state/reader/reducer';

/**
 * Returns the number of feed results for a given query. from 0 to 200.
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  query query
 * @returns {Array} list of feeds that are the result of that query
 */
export default function getReaderFeedsCountForQuery( state, query ) {
	const key = queryKey( query );
	return state.reader.feedSearches.total[ key ];
}
