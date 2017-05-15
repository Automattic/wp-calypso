/**
 * Returns the feeds result for a given query.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  query query
 * @return {Array} list of feeds that are the result of that query
 */
export default function getReaderFeedsForQuery( state, query ) {
	return state.reader.feedSearches.items[ query ];
}
