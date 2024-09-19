import { createHigherOrderComponent } from '@wordpress/compose';
import { useMemo } from 'react';
import { MinimumSite } from './site-type';

type SiteDetailsForSortingWithOptionalUserInteractions = Pick<
	MinimumSite,
	'title' | 'user_interactions' | 'options' | 'is_wpcom_staging_site' | 'ID' | 'plan'
>;

type SiteDetailsForSortingWithUserInteractions = Pick<
	MinimumSite,
	'title' | 'options' | 'is_wpcom_staging_site' | 'ID' | 'plan'
> &
	Required< Pick< MinimumSite, 'user_interactions' > >;

export type SiteDetailsForSorting =
	| SiteDetailsForSortingWithOptionalUserInteractions
	| SiteDetailsForSortingWithUserInteractions;

const validSortKeys = [ 'lastInteractedWith', 'updatedAt', 'alphabetically', 'plan' ] as const;
const validSortOrders = [ 'asc', 'desc' ] as const;

export type SitesSortKey = ( typeof validSortKeys )[ number ];
export type SitesSortOrder = ( typeof validSortOrders )[ number ];

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
				return sortSitesByStaging( sortSitesByLastInteractedWith( allSites, sortOrder ) );
			case 'alphabetically':
				return sortSitesAlphabetically( allSites, sortOrder );
			case 'updatedAt':
				return sortSitesByLastPublish( allSites, sortOrder );
			case 'plan':
				return sortSitesByPlan( allSites, sortOrder );
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
		// This implies that the user interactions are already sorted.
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

export function sortSitesByStaging< T extends SiteDetailsForSorting >( sites: T[] ) {
	type SitesByIdType = {
		index: number;
		site: T;
	};
	const sitesById = sites.reduce< Record< number, SitesByIdType > >(
		( acc, site, currentIndex ) => {
			acc[ site.ID ] = {
				index: currentIndex,
				site,
			};
			return acc;
		},
		{}
	);

	const visited = new Set() as Set< number >;
	const sortedItems = sites.reduce< T[] >( ( acc, site ) => {
		// We have already visited this site, therefore, there is no need to proceed any further.
		if ( visited.has( site.ID ) ) {
			return acc;
		}
		// Site is staging but we haven't visit its production site yet...
		// The production site exists in the site map, and
		// that means that we are going to visit it later on.
		// Don't add it to the list yet.
		if (
			site?.is_wpcom_staging_site &&
			site.options?.wpcom_production_blog_id &&
			! visited.has( site.options?.wpcom_production_blog_id ) &&
			sitesById[ site.options?.wpcom_production_blog_id ]
		) {
			return acc;
		}

		// If the production site associated with this staging site is filtered out,
		// or if we have a production site, add it to the list.
		acc.push( site );
		visited.add( site.ID );

		// Sorting is useful when dealing with multiple staging sites.
		// The sites are already sorted by 'sortSitesByLastInteractedWith',
		// we want to maintain that order in case some of the staging sites are
		// filtered out.
		//
		// Example:
		// A site has the following staging siteIds in wpcom_staging_blog_ids:
		// [ 1, 2, 3, 4]
		// `sortSitesByLastInteractedWith` has already sorted the above sites as follows:
		// [3, 2] and 1,4 are filtered out.
		//
		// If we add them in the order they exist in wpcom_staging_blog_ids array
		// the order would be wrong.
		//
		// So instead, we first sort them, and the list becomes:
		// [3, 2, 1, 4]
		site.options?.wpcom_staging_blog_ids
			?.sort?.( ( a, b ) => {
				// If one of the two staging sites is filtered out, we should
				// maintain the order of the remaining sites by moving it down
				// in the list
				if ( ! sitesById[ a ] ) {
					return -1;
				}
				if ( ! sitesById[ b ] ) {
					return 1;
				}
				return sitesById[ a ]?.index - sitesById[ b ]?.index;
			} )
			.forEach( ( siteId ) => {
				if ( sitesById[ siteId ] && ! visited.has( siteId ) ) {
					acc.push( sitesById[ siteId ].site );
					visited.add( siteId );
				}
			} );
		return acc;
	}, [] );
	return sortedItems;
}

function sortAlphabetically< T extends SiteDetailsForSorting >(
	a: T,
	b: T,
	sortOrder: SitesSortOrder
) {
	if ( ! a?.title || ! b?.title ) {
		return 0;
	}

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

function sortByPlan< T extends SiteDetailsForSorting >( a: T, b: T, sortOrder: SitesSortOrder ) {
	const planA = a.plan?.product_name_short;
	const planB = b.plan?.product_name_short;

	if ( ! planA || ! planB ) {
		return 0;
	}

	return sortOrder === 'asc' ? planA.localeCompare( planB ) : planB.localeCompare( planA );
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

function sortSitesByPlan< T extends SiteDetailsForSorting >(
	sites: T[],
	sortOrder: SitesSortOrder
): T[] {
	return [ ...sites ].sort( ( a, b ) => sortByPlan( a, b, sortOrder ) );
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
