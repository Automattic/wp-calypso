/** @format */
/***
 * Returns the recommended sites paging offset
 *
 * @param  {Object} state  Global state tree
 * @param {Number} seed the elasticsearch seed for which to grab recs
 * @return {Number} the paging offset
 */
export default ( state, seed ) => state.reader.recommendedSites.pagingOffset[ seed ];
