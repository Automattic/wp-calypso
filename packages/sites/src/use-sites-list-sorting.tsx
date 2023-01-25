import { createHigherOrderComponent } from '@wordpress/compose';
import { useMemo } from 'react';
import { MinimumSite } from './site-type';

type SiteDetailsForSortingWithOptionalUserInteractions = Pick<
	MinimumSite,
	'title' | 'user_interactions' | 'options'
>;

type SiteDetailsForSortingWithUserInteractions = Pick< MinimumSite, 'title' | 'options' > &
	Required< Pick< MinimumSite, 'user_interactions' > >;

export type SiteDetailsForSorting =
	| SiteDetailsForSortingWithOptionalUserInteractions
	| SiteDetailsForSortingWithUserInteractions;

const validSortKeys = [ 'lastInteractedWith', 'updatedAt', 'alphabetically' ] as const;
const validSortOrders = [ 'asc', 'desc' ] as const;

export type SitesSortKey = typeof validSortKeys[ number ];
export type SitesSortOrder = typeof validSortOrders[ number ];

export const isValidSorting = ( input: {
	sortKey: string;
	sortOrder: string;
} ): input is Required< SitesSortOptions > => {
	const { sortKey, sortOrder } = input;

	return (
		validSortKeys.includes( sortKey as SitesSortKey ) &&
		validSortOrders.includes( sortOrder as SitesSortOrder )
	);
};

export interface SitesSortOptions {
	sortKey?: SitesSortKey;
	sortOrder?: SitesSortOrder;
}

export function useSitesListSorting< T extends SiteDetailsForSorting >(
	allSites: T[],
	{ sortKey, sortOrder = 'asc' }: SitesSortOptions
) {
	return useMemo( () => {
		switch ( sortKey ) {
			case 'lastInteractedWith':
				return sortSitesByLastInteractedWith( allSites, sortOrder );
			case 'alphabetically':
				return sortSitesAlphabetically( allSites, sortOrder );
			case 'updatedAt':
				return sortSitesByLastPublish( allSites, sortOrder );
			default:
				return allSites;
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
	sortOrder: SitesSortOrder
) {
	const interactedItems = ( sites as SiteDetailsForSorting[] ).filter( hasInteractions );

	const remainingItems = sites.filter(
		( site ) => ! site.user_interactions || site.user_interactions.length === 0
	);

	const sortedItems = [
		...( sortInteractedItems( interactedItems ) as T[] ),
		...remainingItems.sort( ( a, b ) => sortByLastPublish( a, b, 'desc' ) ),
	];

	return sortOrder === 'desc' ? sortedItems : sortedItems.reverse();
}

function sortAlphabetically< T extends SiteDetailsForSorting >(
	a: T,
	b: T,
	sortOrder: SitesSortOrder
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

function sortByLastPublish< T extends SiteDetailsForSorting >(
	a: T,
	b: T,
	sortOrder: SitesSortOrder
) {
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
}

function sortSitesAlphabetically< T extends SiteDetailsForSorting >(
	sites: T[],
	sortOrder: SitesSortOrder
): T[] {
	return [ ...sites ].sort( ( a, b ) => sortAlphabetically( a, b, sortOrder ) );
}

function sortSitesByLastPublish< T extends SiteDetailsForSorting >(
	sites: T[],
	sortOrder: SitesSortOrder
): T[] {
	return [ ...sites ].sort( ( a, b ) => sortByLastPublish( a, b, sortOrder ) );
}

type SitesSortingProps = {
	sitesSorting: SitesSortOptions;
	sites: SiteDetailsForSorting[];
};

export const withSitesListSorting = createHigherOrderComponent(
	< OuterProps extends SitesSortingProps >( Component: React.ComponentType< OuterProps > ) => {
		return ( props: OuterProps ) => {
			const sites = useSitesListSorting( props.sites, props.sitesSorting );

			return <Component { ...props } sites={ sites } />;
		};
	},
	'withSitesSorting'
);
