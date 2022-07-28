import { useMemo } from 'react';
// eslint-disable-next-line no-restricted-imports
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SitesTableSortOptions {
	sortKey?: string;
	sortOrder?: 'asc' | 'desc';
}

interface UseSitesTableSortingResult {
	sortedSites: SiteExcerptData[];
}

export function useSitesTableSorting(
	allSites: SiteExcerptData[],
	{ sortKey, sortOrder = 'asc' }: SitesTableSortOptions
): UseSitesTableSortingResult {
	return useMemo( () => {
		switch ( sortKey ) {
			case 'updated-at':
				return { sortedSites: sortSitesByLastPublish( allSites, sortOrder ) };
			default:
				return { sortedSites: allSites };
		}
	}, [ allSites, sortKey, sortOrder ] );
}

function sortSitesByLastPublish( sites: SiteExcerptData[], sortOrder: string ): SiteExcerptData[] {
	return sites.sort( ( a, b ) => {
		if ( ! a.options?.updated_at || ! b.options?.updated_at ) {
			return 0;
		}

		if ( a.options.updated_at > b.options.updated_at ) {
			return sortOrder === 'asc' ? 1 : -1;
		}

		if ( a.options.updated_at < b.options.updated_at ) {
			return sortOrder === 'asc' ? -1 : 1;
		}

		return 0;
	} );
}
