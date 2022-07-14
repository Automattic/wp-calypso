import type { SitePlan } from '../sites/selectors/get-site-plan';
import type { AppState } from 'calypso/types';

const EMPTY_SITE_EXCERPTS: SiteExcerptsItem = Object.freeze( {} );

export interface SiteExcerptsItem {
	ID?: number;
	name?: string;
	URL?: string;
	slug?: string;
	is_private?: boolean;
	is_coming_soon?: boolean;
	options?: Record< string, unknown >;
	plan?: SitePlan;
}

/**
 * Returns site excerpts object or empty object.
 */
export default function getSiteExcerpts( state: AppState ): Record< number, SiteExcerptsItem > {
	return state.sites.excerpts || EMPTY_SITE_EXCERPTS;
}
