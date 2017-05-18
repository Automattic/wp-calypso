/**
 * Returns the recommended sites for a given seed
 *
 * @param  {Object} state  Global state tree
 * @param {Number} seed the elasticsearch seed for which to grab recs
 * @return {Array} Reader Sites
 */
export default function getReaderRecommendedSites( state, seed ) {
	return state.reader.recommendedSites.items[ seed ];
}
