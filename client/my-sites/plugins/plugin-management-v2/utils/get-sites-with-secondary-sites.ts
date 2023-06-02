import getNetworkSites from 'calypso/state/selectors/get-network-sites';
import isConnectedSecondaryNetworkSite from 'calypso/state/selectors/is-connected-secondary-network-site';
import { IAppState } from 'calypso/state/types';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Returns an array of object which holds site and its secondary sites
 */
export function getSitesWithSecondarySites(
	state: IAppState,
	sites: Array< SiteDetails | null | undefined >
) {
	return sites
		.filter( ( site ) => ! isConnectedSecondaryNetworkSite( state, site?.ID ) )
		.map( ( site ) => ( {
			site,
			secondarySites: getNetworkSites( state, site?.ID ),
		} ) );
}
