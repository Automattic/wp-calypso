import { useFuzzySearch } from '@automattic/search';
import { MinimumSite } from './site-type';

export const SITES_SEARCH_INDEX_KEYS = [ 'name', 'slug', 'title', 'URL' ];

export interface SitesFilterOptions {
	search?: string;
}

type SiteForFiltering = Pick< MinimumSite, 'URL' | 'name' | 'slug' | 'title' >;

export function useSitesListFiltering< T extends SiteForFiltering >(
	sites: T[],
	{ search }: SitesFilterOptions
) {
	const filteredSites = useFuzzySearch( {
		data: sites,
		keys: SITES_SEARCH_INDEX_KEYS,
		query: search,
	} );

	return filteredSites;
}
