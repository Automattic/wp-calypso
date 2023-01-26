import 'calypso/state/site-connection/init';

/**
 * Returns the WordPress.com connection status of a site.
 * Returns null if the site is unknown, or connection status hasn't been received yet.
 *
 * @param  {Object}    state   Global state tree
 * @param  {number}    siteId  The ID of the site we're querying
 * @returns {?boolean}          Whether site is connected to WordPress.com.
 */
export default function getSiteConnectionStatus( state, siteId ) {
	return state.siteConnection.items[ siteId ] ?? null;
}
