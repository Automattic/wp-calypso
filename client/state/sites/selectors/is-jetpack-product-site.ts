import getRawSite from 'calypso/state/selectors/get-raw-site';
import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import { AppState } from 'calypso/types';

type Site = {
	options?: {
		jetpack_connection_active_plugins?: string[];
	};
};

/**
 * Returns true if site is a Jetpack site with a standalone product plugin installed ( i.e. Jetpack
 * Backup ), false if the site has the full Jetpack plugin or is hosted on WordPress.com, or null
 * if the site is unknown.
 *
 * @param {AppState} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean|null} Whether site is a Jetpack site with a standalone product plugin
 */
export default function isJetpackProductSite( state: AppState, siteId: number ): boolean | null {
	const site = getRawSite( state, siteId ) as Site;

	if ( ! site ) {
		return null;
	}

	if ( isSiteWpcom( state, siteId ) ) {
		return false;
	}

	return (
		( site.options?.jetpack_connection_active_plugins || [] ).filter(
			( plugin ) => plugin !== 'jetpack'
		).length > 0
	);
}
