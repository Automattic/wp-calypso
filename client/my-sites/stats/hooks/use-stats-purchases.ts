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

const isProductOwned = ( ownedPurchases: Purchase[], searchedProduct: string ) => {
	if ( ! ownedPurchases.length ) {
		return false;
	}

	return ownedPurchases
		.filter( ( purchase ) => purchase.expiryStatus !== 'expired' )
		.map( ( purchase ) => purchase.productSlug )
		.includes( searchedProduct );
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

	return {
		isRequestingSitePurchases,
		isFreeOwned,
		isPWYWOwned,
		isCommercialOwned,
		supportCommercialUse,
	};
}
