/**
 * Internal dependencies
 */
import queryKey from 'calypso/state/reader/feed-searches/query-key';

import 'calypso/state/reader/init';

/**
 * Returns the feeds result for a given query.
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  query query
 * @returns {Array} list of feeds that are the result of that query
 */
export default function getReaderFeedsForQuery( state, query ) {
	const key = queryKey( query );
	return state.reader.feedSearches.items[ key ];
}
