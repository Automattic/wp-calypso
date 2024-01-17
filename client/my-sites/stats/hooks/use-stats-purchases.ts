import {
	JETPACK_COMPLETE_PLANS,
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_YEARLY,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { isFetchingSitePurchases, getSitePurchases } from 'calypso/state/purchases/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';

const JETPACK_STATS_TIERED_BILLING_LIVE_DATE_2024_01_04 = '2024-01-04T05:30:00+00:00';

const filterPurchasesByProducts = ( ownedPurchases: Purchase[], productSlugs: string[] ) => {
	if ( ! ownedPurchases?.length ) {
		return [];
	}

	return ownedPurchases.filter(
		( purchase ) =>
			purchase.expiryStatus !== 'expired' && productSlugs.includes( purchase.productSlug )
	);
};

const isProductOwned = ( ownedPurchases: Purchase[], searchedProduct: string ) => {
	return filterPurchasesByProducts( ownedPurchases, [ searchedProduct ] ).length > 0;
};

export default function useStatsPurchases( siteId: number | null ) {
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const isRequestingSitePurchases = useSelector( isFetchingSitePurchases );

	// Determine whether a product is owned.
	// TODO we need to do plan check as well, because Stats products would be built into other plans.
	const isFreeOwned = useMemo( () => {
		return isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_FREE );
	}, [ sitePurchases ] );

	const isCommercialOwned = useMemo( () => {
		return (
			isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_MONTHLY ) ||
			isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_YEARLY ) ||
			isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_BI_YEARLY )
		);
	}, [ sitePurchases ] );

	const isPWYWOwned = useMemo( () => {
		return isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_PWYW_YEARLY );
	}, [ sitePurchases ] );

	const supportCommercialUse = useMemo(
		() =>
			isCommercialOwned ||
			JETPACK_COMPLETE_PLANS.some( ( plan ) => isProductOwned( sitePurchases, plan ) ),
		[ sitePurchases, isCommercialOwned ]
	);

	const isLegacyCommercialLicense = useMemo( () => {
		const purchases = filterPurchasesByProducts( sitePurchases, [
			PRODUCT_JETPACK_STATS_MONTHLY,
			PRODUCT_JETPACK_STATS_YEARLY,
			PRODUCT_JETPACK_STATS_BI_YEARLY,
		] );

		if ( purchases.length === 0 ) {
			return false;
		}
		return purchases[ 0 ].subscribedDate < JETPACK_STATS_TIERED_BILLING_LIVE_DATE_2024_01_04;
	}, [ sitePurchases ] );

	return {
		isRequestingSitePurchases,
		isFreeOwned,
		isPWYWOwned,
		isCommercialOwned,
		supportCommercialUse,
		isLegacyCommercialLicense,
	};
}
