import 'calypso/state/reader/init';

/**
 * Returns the related sites for a given tag.
 *
 *
 * @param {string} tag the elasticsearch tag for which to grab recs
 * @returns {Array} array of related sites for a given tag
 */

export default ( state, tag ) => state.reader.relatedSites.items[ tag ];
