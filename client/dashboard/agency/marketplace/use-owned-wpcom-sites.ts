import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { agencyLicensesQuery, countOwnedWpcomSites, getWpcomPlan } from './lib/wpcom-hosting';
import { useMarketplaceType } from './use-marketplace-type';

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
		...agencyLicensesQuery( agencyId ),
		enabled: agencyId > 0,
	} );

	const plan = useMemo( () => getWpcomPlan( products ?? [] ), [ products ] );
	const ownedSites = useMemo(
		() => ( marketplaceType === 'referral' ? 0 : countOwnedWpcomSites( licenses ?? [], plan ) ),
		[ licenses, plan, marketplaceType ]
	);

	// Referrals don't wait on the licenses: nothing owned ever counts.
	return { ownedSites, isReady: marketplaceType === 'referral' || isFetched };
}
