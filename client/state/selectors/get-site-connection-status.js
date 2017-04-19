/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the WordPress.com connection status of a site.
 * Returns null if the site is unknown, or connection status hasn't been received yet.
 *
 * @param  {Object}    state   Global state tree
 * @param  {Number}    siteId  The ID of the site we're querying
 * @return {?Boolean}          Whether site is connected to WordPress.com.
 */
export default function getSiteConnectionStatus( state, siteId ) {
	return get( state.sites.connection.items, siteId, null );
}
