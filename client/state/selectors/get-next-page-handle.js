import 'calypso/state/media/init';

/**
 * Get the next page handle for the sites current media request
 * @param {Object} state The state object
 * @param {number} siteId The site ID
 */
export default function getNextPageHandle( state, siteId ) {
	return state.media.fetching?.[ siteId ]?.nextPageHandle;
}
