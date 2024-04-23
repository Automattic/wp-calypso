import {
	JETPACK_COMPLETE_PLANS,
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_YEARLY,
} from '@automattic/calypso-products';
import { ComponentClass, useMemo } from 'react';
import usePlanUsageQuery from './use-plan-usage-query';
import type { Purchase } from 'calypso/lib/purchases/types';

const JETPACK_STATS_TIERED_BILLING_LIVE_DATE_2024_01_04 = '2024-01-04T05:30:00+00:00';

const filterPurchasesByProducts = (
	ownedPurchases: Purchase[] | undefined,
	productSlugs: string[]
) => {
	if ( ! ownedPurchases?.length ) {
		return [];
	}

	return ownedPurchases.filter(
		( purchase ) =>
			purchase.expiryStatus !== 'expired' && productSlugs.includes( purchase.productSlug )
	);
};

const isProductOwned = ( ownedPurchases: Purchase[] | undefined, searchedProduct: string ) => {
	return filterPurchasesByProducts( ownedPurchases, [ searchedProduct ] ).length > 0;
};

export default function useStatsPurchases( siteId: number | null ) {
	const { data: planUsage, isPending, isFetching } = usePlanUsageQuery( siteId );

	const statsPurchases = useMemo( () => {
		const sitePurchases = planUsage?.purchases;

		if ( isFetching || isPending || ! sitePurchases ) {
			return { isLoading: true };
		}

		// Determine whether a product is owned.
		// TODO we need to do plan check as well, because Stats products would be built into other plans.
		const isFreeOwned = isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_FREE );

		const isCommercialOwned =
			isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_MONTHLY ) ||
			isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_YEARLY ) ||
			isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_BI_YEARLY );

		const isPWYWOwned = isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_PWYW_YEARLY );

		const supportCommercialUse =
			isCommercialOwned ||
			JETPACK_COMPLETE_PLANS.some( ( plan ) => isProductOwned( sitePurchases, plan ) );

		const legacyPurchases = filterPurchasesByProducts( sitePurchases, [
			PRODUCT_JETPACK_STATS_MONTHLY,
			PRODUCT_JETPACK_STATS_YEARLY,
			PRODUCT_JETPACK_STATS_BI_YEARLY,
		] );

		const isLegacyCommercialLicense =
			legacyPurchases.length > 0 &&
			legacyPurchases[ 0 ].subscribedDate < JETPACK_STATS_TIERED_BILLING_LIVE_DATE_2024_01_04;

		return {
			isRequestingSitePurchases: isFetching,
			isFreeOwned,
			isPWYWOwned,
			isCommercialOwned,
			supportCommercialUse,
			isLegacyCommercialLicense,
			hasLoadedSitePurchases: ! isPending,
			hasAnyPlan: isFreeOwned || isCommercialOwned || isPWYWOwned || supportCommercialUse,
			isLoading: isPending,
		};
	}, [ isFetching ] );

	return statsPurchases;
}

export const withStatsPurchases =
	( WrappedComponent: ComponentClass ) => ( props: { siteId: number | null } ) => {
		const statsPurchases = useStatsPurchases( props.siteId );
		return <WrappedComponent { ...props } { ...statsPurchases } />;
	};
