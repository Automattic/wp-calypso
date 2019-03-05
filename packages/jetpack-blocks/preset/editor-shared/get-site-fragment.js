/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteFragment as getCalypsoSiteFragment } from 'lib/route/path';

/***
 * Returns the site fragment in the environment we're running Gutenberg in.
 *
 * @returns {?Number|String} Site fragment (ID or slug); null for WP.org wp-admin.
 */
export default function getSiteFragment() {
	// WP.com wp-admin exposes the site ID in window._currentSiteId
	if ( window && window._currentSiteId ) {
		return window._currentSiteId;
	}

	// Calypso will contain a site slug or ID in the site fragment.
	// WP.org will contain either `post` or `post-new.php`.
	const siteFragment = getCalypsoSiteFragment( window.location.pathname );
	if ( ! includes( [ 'post.php', 'post-new.php' ], siteFragment ) ) {
		return siteFragment || null;
	}

	// Gutenberg in Jetpack adds a site fragment in the initial state
	if (
		window &&
		window.Jetpack_Editor_Initial_State &&
		window.Jetpack_Editor_Initial_State.siteFragment
	) {
		return window.Jetpack_Editor_Initial_State.siteFragment;
	}

	return null;
}
