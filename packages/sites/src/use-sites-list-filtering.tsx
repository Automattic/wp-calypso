import { useFuzzySearch } from '@automattic/search';
import { useMemo } from 'react';
import { MinimumSite } from './site-type';

export const SITES_SEARCH_INDEX_KEYS = [ 'name', 'slug', 'title', 'URL' ];

export interface SitesFilterOptions {
	search?: string;
	includeA8CSites?: boolean;
}

type SiteForFiltering = Pick< MinimumSite, 'URL' | 'name' | 'slug' | 'title' | 'is_a8c' >;

export function useSitesListFiltering< T extends SiteForFiltering >(
	sites: T[],
	{ search, includeA8CSites = false }: SitesFilterOptions
) {
	const filteredSites = useFuzzySearch( {
		data: sites,
		keys: SITES_SEARCH_INDEX_KEYS,
		query: search,
	} );

	return useMemo( () => {
		if ( ! includeA8CSites ) {
			return filteredSites.filter( ( site ) => ! site.is_a8c );
		}

		return filteredSites;
	}, [ filteredSites, includeA8CSites ] );
}
