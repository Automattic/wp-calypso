import { useMemo } from 'react';

export interface SiteDetailsForSorting {
	name: string;
	options?: {
		updated_at?: string;
	};
}

export type SitesTableSortKey = 'updatedAt' | 'alphabetically';
export type SitesTableSortOrder = 'asc' | 'desc';

interface SitesTableSortOptions {
	sortKey?: SitesTableSortKey;
	sortOrder?: SitesTableSortOrder;
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
			case 'alphabetically':
				return { sortedSites: sortSitesAlphabetically( allSites, sortOrder ) };
			case 'updatedAt':
				return { sortedSites: sortSitesByLastPublish( allSites, sortOrder ) };
			default:
				return { sortedSites: allSites };
		}
	}, [ allSites, sortKey, sortOrder ] );
}

function sortSitesAlphabetically< T extends SiteDetailsForSorting >(
	sites: T[],
	sortOrder: SitesTableSortOrder
): T[] {
	return [ ...sites ].sort( ( a, b ) => {
		const normalizedA = a.name.toLocaleLowerCase();
		const normalizedB = b.name.toLocaleLowerCase();

		if ( normalizedA > normalizedB ) {
			return sortOrder === 'asc' ? 1 : -1;
		}

		if ( normalizedA < normalizedB ) {
			return sortOrder === 'asc' ? -1 : 1;
		}

		return 0;
	} );
}

function sortSitesByLastPublish< T extends SiteDetailsForSorting >(
	sites: T[],
	sortOrder: SitesTableSortOrder
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
