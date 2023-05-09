import 'calypso/state/media/init';

/**
 * Gets the MediaQueryManager for the site
 *
 * @param {Object} state The state object
 * @param {number} siteId The site ID
 */
export default function getMediaQueryManager( state, siteId ) {
	return state.media?.queries?.[ siteId ] ?? null;
}
