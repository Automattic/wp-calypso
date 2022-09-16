import { useMemo } from 'react';

export interface SiteDetailsForSorting {
	title: string;
	user_interactions?: string[];
	options?: {
		updated_at?: string;
	};
}

export type SitesTableSortKey = 'lastInteractedWith' | 'updatedAt' | 'alphabetically';
export type SitesTableSortOrder = 'asc' | 'desc';

export interface SitesTableSortOptions {
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
			case 'lastInteractedWith':
				return { sortedSites: sortSitesByLastInteractedWith( allSites, sortOrder ) };
			case 'alphabetically':
				return { sortedSites: sortSitesAlphabetically( allSites, sortOrder ) };
			case 'updatedAt':
				return { sortedSites: sortSitesByLastPublish( allSites, sortOrder ) };
			default:
				return { sortedSites: allSites };
		}
	}, [ allSites, sortKey, sortOrder ] );
}

function sortSitesByLastInteractedWith< T extends SiteDetailsForSorting >(
	sites: T[],
	sortOrder: SitesTableSortOrder
) {
	const interactedItems = sites.filter(
		( site ) => site.user_interactions && site.user_interactions.length > 0
	);
	const remainingItems = sites.filter(
		( site ) => ! site.user_interactions || site.user_interactions.length === 0
	);

	return [
		...interactedItems.sort( ( a, b ) => {
			if ( ! a.user_interactions || ! b.user_interactions ) {
				return 0;
			}

			// Interactions are sorted in descending order.
			const lastInteractionA = a.user_interactions[ 0 ];
			const lastInteractionB = b.user_interactions[ 0 ];

			if ( lastInteractionA > lastInteractionB ) {
				return sortOrder === 'asc' ? 1 : -1;
			}

			if ( lastInteractionA < lastInteractionB ) {
				return sortOrder === 'asc' ? -1 : 1;
			}

			// If the interaction date is equal, sort alphabetically.
			return sortAlphabetically( a, b, 'asc' );
		} ),
		...remainingItems.sort( ( a, b ) => sortAlphabetically( a, b, 'asc' ) ),
	];
}

function sortAlphabetically< T extends SiteDetailsForSorting >(
	a: T,
	b: T,
	sortOrder: SitesTableSortOrder
) {
	const normalizedA = a.title.toLocaleLowerCase();
	const normalizedB = b.title.toLocaleLowerCase();

	if ( normalizedA > normalizedB ) {
		return sortOrder === 'asc' ? 1 : -1;
	}

	if ( normalizedA < normalizedB ) {
		return sortOrder === 'asc' ? -1 : 1;
	}

	return 0;
}

function sortSitesAlphabetically< T extends SiteDetailsForSorting >(
	sites: T[],
	sortOrder: SitesTableSortOrder
): T[] {
	return [ ...sites ].sort( ( a, b ) => sortAlphabetically( a, b, sortOrder ) );
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
