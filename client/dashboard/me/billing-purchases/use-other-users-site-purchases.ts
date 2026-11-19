import { sitePurchasesQuery } from '@automattic/api-queries';
import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '../../app/auth';
import type { Purchase, Site } from '@automattic/api-core';

// Each filtered site costs one request, so stop fetching other users' purchases
// once the filter is broad enough that it no longer reads as "this site".
const MAX_SITES = 5;

/**
 * Purchases on the filtered sites that belong to other users.
 *
 * The list is built from the current user's purchases, so a site filter on its
 * own would hide purchases another administrator made on that site. Site
 * managers can see those through the site-scoped endpoint, so fetch them for
 * each filtered site the user manages.
 *
 * The user's own purchases are left to `userPurchasesQuery()`, which also hides
 * internal system products that the site endpoint returns.
 */
export function useOtherUsersSitePurchases( {
	siteIds,
	sites,
}: {
	siteIds: number[];
	sites: Site[];
} ): { purchases: Purchase[]; isLoading: boolean; isSuccess: boolean } {
	const { user } = useAuth();
	const managedSiteIds =
		siteIds.length > MAX_SITES
			? []
			: siteIds.filter(
					( siteId ) => sites.find( ( site ) => site.ID === siteId )?.capabilities?.manage_options
				);

	// A stable `combine` lets TanStack Query reuse the result between renders.
	const combine = useCallback(
		( results: UseQueryResult< Purchase[] >[] ) => ( {
			purchases: results.flatMap( ( { data = [] } ) =>
				data.filter( ( purchase ) => String( purchase.user_id ) !== String( user.ID ) )
			),
			isLoading: results.some( ( { isLoading } ) => isLoading ),
			// A failed or paused request leaves it unknown whether the site has more purchases.
			isSuccess: results.every( ( { isSuccess } ) => isSuccess ),
			count: results.length,
		} ),
		[ user.ID ]
	);

	const { purchases, isLoading, isSuccess, count } = useQueries( {
		queries: managedSiteIds.map( ( siteId ) => ( {
			...sitePurchasesQuery( siteId ),
			// The user may have lost manage rights since `sitesQuery()` loaded;
			// a 403 just means there is nothing extra to show.
			retry: false,
		} ) ),
		combine,
	} );

	return {
		purchases,
		isLoading,
		// The combined result can lag one render behind a change in the sites to
		// fetch, so it only counts once it covers all of them.
		isSuccess: isSuccess && count === managedSiteIds.length,
	};
}
