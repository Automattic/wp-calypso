import getRawSite from 'calypso/state/selectors/get-raw-site';
import { IAppState } from 'calypso/state/types';

/**
 * Returns true if site is a Jetpack site, false if the site is hosted on
 * WordPress.com, or null if the site is unknown.
 */
export default function isJetpackSite( state: IAppState, siteId: number | null ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	return site.jetpack;
}
