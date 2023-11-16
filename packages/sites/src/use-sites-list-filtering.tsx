import { useFuzzySearch } from '@automattic/search';
import { MinimumSite } from './site-type';

export const SITES_SEARCH_INDEX_KEYS = [ 'name', 'slug', 'title', 'URL' ];

export interface SitesFilterOptions {
	search?: string;
	userId?: number | null;
	isFilterByOwner?: boolean;
}

type SiteForFiltering = Pick< MinimumSite, 'URL' | 'name' | 'slug' | 'title' | 'site_owner' >;

export function useSitesListFiltering< T extends SiteForFiltering >(
	sites: T[],
	{ search, userId, isFilterByOwner }: SitesFilterOptions
) {
	if ( isFilterByOwner && userId ) {
		sites = sites.filter( ( site ) => site.site_owner === userId );
	}
	const filteredSites = useFuzzySearch( {
		data: sites,
		keys: SITES_SEARCH_INDEX_KEYS,
		query: search,
	} );

	return filteredSites;
}
