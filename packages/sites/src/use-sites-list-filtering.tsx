import { useFuzzySearch } from '@automattic/search';
import { useMemo } from 'react';
import { MinimumSite } from './site-type';

export const SITES_SEARCH_INDEX_KEYS = [ 'name', 'slug', 'title', 'URL' ];

export interface SitesFilterOptions {
	search?: string;
	includeA8CSites?: boolean;
}

type SiteForFiltering = Pick< MinimumSite, 'URL' | 'name' | 'slug' | 'title' | 'site_owner' >;

const isA8CSite = ( site: SiteForFiltering ) => site.site_owner === 26957695;

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
			return filteredSites.filter( ( site ) => ! isA8CSite( site ) );
		}

		return filteredSites;
	}, [ filteredSites, includeA8CSites ] );
}
