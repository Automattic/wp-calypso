/**
 * Internal dependencies
 */
import 'state/reader/init';

/**
 * Get the site id that is currently viewed by the user in full post page
 *
 * @param state redux state
 * @returns {number} site Id or null
 */
export function getViewingFullPostSiteId( state ) {
	return state.reader.viewing.fullPost;
}

/**
 * Get a list of site ids that are currently viewed by the user in reader feeds or full post page
 *
 * @param state redux state
 * @returns {[]} list of site ids that are currently viewed
 */
export function getViewingSiteIds( state ) {
	const viewingSites = state.reader.viewing;
	const siteIds = [];

	if ( viewingSites.feed ) {
		for ( const siteId in viewingSites.list ) {
			if ( viewingSites.list[ siteId ].length > 0 ) {
				siteIds.push( parseInt( siteId ) );
			}
		}
	}

	if ( viewingSites.fullPost ) {
		siteIds.push( parseInt( viewingSites.fullPost ) );
	}

	return siteIds;
}
