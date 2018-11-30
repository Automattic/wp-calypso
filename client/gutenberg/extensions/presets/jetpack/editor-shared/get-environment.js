/** @format */

/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteFragment } from 'lib/route/path';

/***
 * Returns the current environment we're running Gutenberg in.
 * @returns {string} Current environment, one of:
 * - `wpcom` - running in WP.com wp-admin
 * - `wporg` - running in WP.org wp-admin
 * - `calypso` - running in Calypso
 */
export default function getEnvironment() {
	// WP.com wp-admin exposes the site ID in window._currentSiteId
	if ( window._currentSiteId ) {
		return 'wpcom';
	}

	// Calypso will contain a site slug or ID in the site fragment.
	// WP.org will contain either `post` or `post-new.php`.
	const siteFragment = getSiteFragment( window.location.pathname );
	if ( includes( [ 'post.php', 'post-new.php' ], siteFragment ) ) {
		return 'wporg';
	}

	return 'calypso';
}
