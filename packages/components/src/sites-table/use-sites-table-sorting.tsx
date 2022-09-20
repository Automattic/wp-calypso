import { useMemo } from 'react';

export interface SiteDetailsForSorting {
	title: string;
	user_interactions?: string[];
	options?: {
		updated_at?: string;
	};
}

const validSortKeys = [ 'lastInteractedWith', 'updatedAt', 'alphabetically' ] as const;
const validSortOrders = [ 'asc', 'desc' ] as const;

export type SitesTableSortKey = typeof validSortKeys[ number ];
export type SitesTableSortOrder = typeof validSortOrders[ number ];

export const isValidSorting = ( input: {
	sortKey: string;
	sortOrder: string;
} ): input is Required< SitesTableSortOptions > => {
	const { sortKey, sortOrder } = input;

	return (
		validSortKeys.includes( sortKey as SitesTableSortKey ) &&
		validSortOrders.includes( sortOrder as SitesTableSortOrder )
	);
};

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
	const mostRecentInteraction = [
		...( sites
			.map( ( site ) => site.user_interactions )
			.flat( 1 )
			.sort()
			.reverse() || [] ),
	].pop();
	let threeDaysAgo = '';
	let sevenDaysAgo = '';
	let twoWeeksAgo = '';
	if ( mostRecentInteraction ) {
		const date = new Date( mostRecentInteraction );
		date.setDate( date.getDate() - 3 );
		threeDaysAgo = [
			date.getFullYear(),
			( '0' + ( date.getMonth() + 1 ) ).slice( -2 ),
			( '0' + date.getDate() ).slice( -2 ),
		].join( '-' );
		date.setDate( date.getDate() - 4 );
		sevenDaysAgo = [
			date.getFullYear(),
			( '0' + ( date.getMonth() + 1 ) ).slice( -2 ),
			( '0' + date.getDate() ).slice( -2 ),
		].join( '-' );
		date.setDate( date.getDate() - 7 );
		twoWeeksAgo = [
			date.getFullYear(),
			( '0' + ( date.getMonth() + 1 ) ).slice( -2 ),
			( '0' + date.getDate() ).slice( -2 ),
		].join( '-' );
	}

	const interactedItems = sites.filter(
		( site ) => site.user_interactions && site.user_interactions.length > 0
	);
	const remainingItems = sites.filter(
		( site ) => ! site.user_interactions || site.user_interactions.length === 0
	);

	const scoreInteractions = ( interactions: string[] ) => {
		let score = 0;
		interactions.forEach( ( interaction: string ) => {
			if ( interaction >= threeDaysAgo ) {
				score += 3;
			} else if ( interaction >= sevenDaysAgo ) {
				score += 2;
			} else if ( interaction >= twoWeeksAgo ) {
				score += 1;
			}
		} );
		return score;
	};

	const sortedItems = [
		...interactedItems.sort( ( a, b ) => {
			if ( ! a.user_interactions || ! b.user_interactions ) {
				return 0;
			}

			const lastInteractionA = a.user_interactions.sort().reverse()[ 0 ] || 0;
			const lastInteractionB = b.user_interactions.sort().reverse()[ 0 ] || 0;

			// If one of these interactions is within fourteen days of the most recent
			// interaction, sort by the frequency of interactions in that time period.
			if ( twoWeeksAgo && ( lastInteractionA > twoWeeksAgo || lastInteractionB > twoWeeksAgo ) ) {
				const scoreA = scoreInteractions( a.user_interactions );
				const scoreB = scoreInteractions( b.user_interactions );
				if ( scoreA > scoreB ) {
					return -1;
				}
				if ( scoreA < scoreB ) {
					return 1;
				}
				// Fall through to comparing the most recent.
			}

			if ( lastInteractionA > lastInteractionB ) {
				return -1;
			}

			if ( lastInteractionA < lastInteractionB ) {
				return 1;
			}

			// If the interaction date is equal, sort alphabetically.
			return sortAlphabetically( a, b, 'asc' );
		} ),
		...remainingItems.sort( ( a, b ) => sortAlphabetically( a, b, 'asc' ) ),
	];
	return 'desc' === sortOrder ? sortedItems : sortedItems.reverse();
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
