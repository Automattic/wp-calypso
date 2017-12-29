/**
 * Returns the recommended sites for a given seed.
 * 
 *
 * @format
 * @param {Number} seed the elasticsearch seed for which to grab recs
 * @return {Array} array of recommended sites for a given seed
 */

export default ( state, seed ) => state.reader.recommendedSites.items[ seed ];
