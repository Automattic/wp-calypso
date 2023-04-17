import 'calypso/state/reader/init';

/**
 * Returns the related sites paging offset
 *
 *
 * @param {string} tag the elasticsearch tag for which to grab recs
 * @returns {number} the paging offset
 */

export default ( state, tag ) => state.reader.relatedSites.pagingOffset[ tag ];
