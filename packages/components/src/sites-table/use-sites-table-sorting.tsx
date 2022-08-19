import { useMemo } from 'react';
import type { SiteDetails } from '@automattic/data-stores';

export type SiteDetailsForSorting = Partial< Pick< SiteDetails, 'options' > >;

interface SitesTableSortOptions {
	sortKey?: string;
	sortOrder?: 'asc' | 'desc';
}

interface UseSitesTableSortingResult< T extends SiteDetailsForSorting > {
	sortedSites: T[];
}

export function useSitesTableSorting< T extends SiteDetailsForSorting >(
	allSites: T[],
	{ sortKey, sortOrder = 'asc' }: SitesTableSortOptions
): UseSitesTableSortingResult< T > {
	return useMemo( () => {
		switch ( sortKey ) {
			case 'updated-at':
				return { sortedSites: sortSitesByLastPublish( allSites, sortOrder ) };
			default:
				return { sortedSites: allSites };
		}
	}, [ allSites, sortKey, sortOrder ] );
}

function sortSitesByLastPublish< T extends SiteDetailsForSorting >(
	sites: T[],
	sortOrder: string
): T[] {
	return [ ...sites ].sort( ( a, b ) => {
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
