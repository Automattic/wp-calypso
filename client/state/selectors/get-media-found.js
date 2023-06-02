import 'calypso/state/media/init';

/**
 * Returns number of media items for a specified site ID and query.
 *
 * @param {any}    state  The global state
 * @param {string} siteId The site ID
 * @param {Object} query  Query object
 * @returns {?number}     Number of media items found
 */
export default function getMediaFound( state, siteId, query ) {
	const queries = state.media.queries[ siteId ];

	if ( ! queries ) {
		return null;
	}

	return queries.getFound( query );
}
