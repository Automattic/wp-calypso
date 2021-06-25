/**
 * Internal dependencies
 */
import 'calypso/state/reader/init';

/**
 * Returns the recommended sites for a given seed.
 *
 *
 * @param {number} seed the elasticsearch seed for which to grab recs
 * @returns {Array} array of recommended sites for a given seed
 */

export default ( state, seed ) => state.reader.recommendedSites.items[ seed ];
