import type { SitePlan } from '../sites/selectors/get-site-plan';
import type { AppState } from 'calypso/types';

const EMPTY_SITES: SitesItem = Object.freeze( {} );

export interface SitesItem {
	ID?: number;
	name?: string;
	description?: string;
	URL?: string;
	capabilities?: Record< string, boolean >;
	jetpack?: boolean;
	is_multisite?: boolean;
	site_owner?: number;
	lang?: string;
	visible?: boolean;
	is_private?: boolean;
	is_coming_soon?: boolean;
	single_user_site?: boolean;
	is_vip?: boolean;
	options?: Record< string, unknown >;
	plan?: SitePlan;
}

/**
 * Returns site items object or empty object.
 */
export default function getSitesItems( state: AppState ): Record< number, SitesItem > {
	return state.sites.items || EMPTY_SITES;
}
