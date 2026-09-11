import {
	JetpackLicenseFilter,
	JetpackLicenseSortDirection,
	JetpackLicenseSortField,
} from '@automattic/api-core';
import {
	activeAgencyQuery,
	agencyProductsQuery,
	jetpackAgencyLicensesQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { countOwnedWpcomSites, getWpcomPlan } from './lib/wpcom-hosting';
import { useMarketplaceType } from './use-marketplace-type';

const LICENSES_STALE_TIME = 5 * 60 * 1000;

/**
 * How many WordPress.com sites the agency pays for today. They raise the
 * volume tier of new sites, so the cart and the Hosting page both need the
 * same number. Referrals never count what the agency owns.
 */
export function useOwnedWpcomSites() {
	const { marketplaceType } = useMarketplaceType();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const { data: products } = useQuery( agencyProductsQuery( agencyId ) );
	const { data: licenses, isFetched } = useQuery( {
		...jetpackAgencyLicensesQuery( agencyId, {
			filter: JetpackLicenseFilter.NotRevoked,
			sortField: JetpackLicenseSortField.IssuedAt,
			sortDirection: JetpackLicenseSortDirection.Descending,
		} ),
		enabled: agencyId > 0,
		staleTime: LICENSES_STALE_TIME,
	} );

	const plan = useMemo( () => getWpcomPlan( products ?? [] ), [ products ] );
	const ownedSites = useMemo(
		() => ( marketplaceType === 'referral' ? 0 : countOwnedWpcomSites( licenses ?? [], plan ) ),
		[ licenses, plan, marketplaceType ]
	);

	return { ownedSites, isReady: isFetched };
}
