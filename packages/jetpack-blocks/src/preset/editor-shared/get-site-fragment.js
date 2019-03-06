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
