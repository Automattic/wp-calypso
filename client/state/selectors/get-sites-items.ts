import type { SiteDetails } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

const EMPTY_SITES = Object.freeze( {} );

/**
 * Returns site items object or empty object.
 */
export default function getSitesItems( state: AppState ): Record< number | string, SiteDetails > {
	return state.sites?.items || EMPTY_SITES;
}
