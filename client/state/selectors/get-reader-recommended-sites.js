/***
 * Returns the recommended sites for a given seed.
 *
 * @param  {Object} state  Global state tree
 * @param {Number} seed the elasticsearch seed for which to grab recs
 * @return {Object} { recommendedSites: [ Reader Sites ], offset:  Current paging offset }
 */
const getReaderRecommendedSites = ( state, seed ) => ( {
	recommendedSites: state.reader.recommendedSites.items[ seed ],
	offset: state.reader.recommendedSites.pagingOffset[ seed ],
} );
export default getReaderRecommendedSites;
