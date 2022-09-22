import { useFuzzySearch } from '@automattic/search';

export const SITES_SEARCH_INDEX_KEYS = [ 'name', 'slug', 'title', 'URL' ];

interface SitesFilterOptions {
	search?: string;
}

type SiteObjectWithBasicInfo = {
	URL: string;
	name: string | undefined;
	slug: string;
	title: string;
	visible?: boolean;
};

export function useSitesListFiltering< T extends SiteObjectWithBasicInfo >(
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
