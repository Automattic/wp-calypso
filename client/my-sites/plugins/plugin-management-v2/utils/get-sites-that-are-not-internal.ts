import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { IAppState } from 'calypso/state/types';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Filters an array of site details to get sites that are not P2s.
 * @param state - The application state.
 * @param sites - An array of site details.
 * @returns An array of site details that are not P2s.
 */
export function getSitesThatAreNotInternal(
	state: IAppState,
	sites: Array< SiteDetails | null | undefined >
) {
	return sites.filter( ( site ) => {
		const siteId = site?.ID;
		if ( ! siteId ) {
			return false;
		}

		return ! isSiteWPForTeams( state, siteId ) && ! isSiteP2Hub( state, siteId );
	} );
}
