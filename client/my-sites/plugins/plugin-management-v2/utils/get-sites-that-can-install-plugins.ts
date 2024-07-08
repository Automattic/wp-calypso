import { WPCOM_FEATURES_INSTALL_PLUGINS } from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { IAppState } from 'calypso/state/types';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Filters an array of sites to return only the sites that have the capability to install plugins.
 * @param state - The application state.
 * @param sites - An array of SiteDetails objects representing the sites to filter.
 * @returns An array of SiteDetails objects that can install plugins.
 */
export function getSitesThatCanInstallPlugins(
	state: IAppState,
	sites: Array< SiteDetails | null | undefined >
) {
	return sites.filter( ( site ) => {
		return siteHasFeature( state, site?.ID, WPCOM_FEATURES_INSTALL_PLUGINS );
	} );
}
