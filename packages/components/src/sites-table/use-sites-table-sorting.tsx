import { useMemo } from 'react';

interface SiteDetailsForSortingWithOptionalUserInteractions {
	title: string;
	user_interactions?: string[];
	options?: {
		updated_at?: string;
	};
}

interface SiteDetailsForSortingWithUserInteractions {
	title: string;
	user_interactions: string[];
	options?: {
		updated_at?: string;
	};
}

export type SiteDetailsForSorting =
	| SiteDetailsForSortingWithOptionalUserInteractions
	| SiteDetailsForSortingWithUserInteractions;

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

const subtractDays = ( date: string, days: number ) => {
	const MILLISECONDS_IN_DAY = 86400 * 1000;
	const timestamp = new Date( date ).valueOf();

	const subtractedDate = new Date( timestamp - MILLISECONDS_IN_DAY * days );

	const year = subtractedDate.getFullYear();
	const month = subtractedDate.getMonth().toString().padStart( 2, '0' );
	const day = subtractedDate.getDate().toString().padStart( 2, '0' );

	return `${ year }-${ month }-${ day }`;
};

const sortInteractedItems = ( interactedItems: SiteDetailsForSortingWithUserInteractions[] ) => {
	const [ mostRecentInteraction ] = interactedItems
		.map( ( site ) => site.user_interactions )
		.flat()
		.sort()
		.reverse();

	const threeDaysAgo = subtractDays( mostRecentInteraction, 3 );
	const sevenDaysAgo = subtractDays( mostRecentInteraction, 7 );
	const twoWeeksAgo = subtractDays( mostRecentInteraction, 14 );

	const scoreInteractions = ( interactions: string[] ) => {
		return interactions.reduce( ( score, interaction ) => {
			if ( interaction >= threeDaysAgo ) {
				score += 3;
			} else if ( interaction >= sevenDaysAgo ) {
				score += 2;
			} else if ( interaction >= twoWeeksAgo ) {
				score += 1;
			}

			return score;
		}, 0 );
	};

	const sortedInteractions = interactedItems.sort( ( a, b ) => {
		const mostRecentInteractionA = a.user_interactions[ 0 ];
		const mostRecentInteractionB = b.user_interactions[ 0 ];

		// If one of these interactions is within fourteen days of the most recent
		// interaction, sort by the frequency of interactions in that time period.
		if ( mostRecentInteractionA > twoWeeksAgo || mostRecentInteractionB > twoWeeksAgo ) {
			const scoreA = scoreInteractions( a.user_interactions );
			const scoreB = scoreInteractions( b.user_interactions );

			if ( scoreA > scoreB ) {
				return -1;
			}

			if ( scoreA < scoreB ) {
				return 1;
			}

			// Otherwise, compare the most recent.
		}

		if ( mostRecentInteractionA > mostRecentInteractionB ) {
			return -1;
		}

		if ( mostRecentInteractionA < mostRecentInteractionB ) {
			return 1;
		}

		// If the interaction date is equal, sort alphabetically.
		return sortAlphabetically( a, b, 'asc' );
	} );

	return sortedInteractions;
};

const hasInteractions = (
	site: SiteDetailsForSorting
): site is SiteDetailsForSortingWithUserInteractions => {
	return !! site.user_interactions && site.user_interactions.length > 0;
};

function sortSitesByLastInteractedWith< T extends SiteDetailsForSorting >(
	sites: T[],
	sortOrder: SitesTableSortOrder
) {
	const interactedItems = ( sites as SiteDetailsForSorting[] ).filter( hasInteractions );

	const remainingItems = sites.filter(
		( site ) => ! site.user_interactions || site.user_interactions.length === 0
	);

	const sortedItems = [
		...( sortInteractedItems( interactedItems ) as T[] ),
		...remainingItems.sort( ( a, b ) => sortAlphabetically( a, b, 'asc' ) ),
	];

	return sortOrder === 'desc' ? sortedItems : sortedItems.reverse();
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
