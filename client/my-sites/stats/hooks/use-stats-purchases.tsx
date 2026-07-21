import {
	JETPACK_COMPLETE_PLANS,
	JETPACK_GROWTH_PLANS,
	JETPACK_SECURITY_PLANS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_YEARLY,
} from '@automattic/calypso-products';
import { createSelector } from '@automattic/state-utils';
import { ComponentClass, useMemo } from 'react';
import { isRemoved } from 'calypso/lib/purchases';
import { useSelector } from 'calypso/state';
import {
	isFetchingSitePurchases,
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	getPurchases,
} from 'calypso/state/purchases/selectors';
import {
	getShouldShowPaywallNotice,
	getShouldShowPaywallAfterGracePeriod,
} from 'calypso/state/stats/plan-usage/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';

const JETPACK_STATS_TIERED_BILLING_LIVE_DATE_2024_01_04 = '2024-01-04T05:30:00+00:00';
const JETPACK_BUSINESS_PLANS = [ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY ];

/**
 * Checks if a purchase is still valid for providing its product.
 *
 * A purchase is valid as long as its subscription is still active, which includes
 * the post-expiry grace period (during which it can still be renewed). Only a
 * fully-removed subscription is invalid.
 * @param {Purchase} purchase - The purchase object to check.
 * @returns {boolean} - Returns false only if the subscription has been removed.
 */
const isPurchaseValid = ( purchase: Purchase ) => {
	return ! isRemoved( purchase );
};

const filterPurchasesByProducts = ( ownedPurchases: Purchase[], productSlugs: string[] ) => {
	if ( ! ownedPurchases?.length ) {
		return [];
	}

	// Filter purchases by both slug and validity.
	return ownedPurchases.filter(
		( purchase ) => isPurchaseValid( purchase ) && productSlugs.includes( purchase.productSlug )
	);
};

const isProductOwned = ( ownedPurchases: Purchase[], searchedProduct: string ) => {
	return filterPurchasesByProducts( ownedPurchases, [ searchedProduct ] ).length > 0;
};

const areProductsOwned = ( ownedPurchases: Purchase[], searchedProducts: string[] ) => {
	return filterPurchasesByProducts( ownedPurchases, searchedProducts ).length > 0;
};

const isCommercialPurchaseOwned = ( ownedPurchases: Purchase[] ) => {
	return areProductsOwned( ownedPurchases, [
		PRODUCT_JETPACK_STATS_MONTHLY,
		PRODUCT_JETPACK_STATS_YEARLY,
		PRODUCT_JETPACK_STATS_BI_YEARLY,
	] );
};

const supportCommercialPurchaseUse = ( ownedPurchases: Purchase[] ) => {
	return (
		isCommercialPurchaseOwned( ownedPurchases ) ||
		[ ...JETPACK_BUSINESS_PLANS, ...JETPACK_COMPLETE_PLANS, ...JETPACK_GROWTH_PLANS ].some(
			( plan ) => isProductOwned( ownedPurchases, plan )
		)
	);
};

const isVideoPressOwned = ( ownedPurchases: Purchase[] ) => {
	return areProductsOwned( ownedPurchases, [ ...JETPACK_VIDEOPRESS_PRODUCTS ] );
};

export const hasBusinessPlan = ( ownedPurchases: Purchase[] ) => {
	return areProductsOwned( ownedPurchases, [ ...JETPACK_BUSINESS_PLANS ] );
};

export const hasCompletePlan = ( ownedPurchases: Purchase[] ) => {
	return areProductsOwned( ownedPurchases, [ ...JETPACK_COMPLETE_PLANS ] );
};

export const hasGrowthPlan = ( ownedPurchases: Purchase[] ) => {
	return areProductsOwned( ownedPurchases, [ ...JETPACK_GROWTH_PLANS ] );
};

export const hasSecurityPlan = ( ownedPurchases: Purchase[] ) => {
	return areProductsOwned( ownedPurchases, [ ...JETPACK_SECURITY_PLANS ] );
};

export const hasSupportedCommercialUse = ( state: object, siteId: number | null ) => {
	const sitePurchases = getSitePurchases( state, siteId );

	return supportCommercialPurchaseUse( sitePurchases );
};

export const hasSupportedVideoPressUse = ( state: object, siteId: number | null ) => {
	const sitePurchases = getSitePurchases( state, siteId );

	return isVideoPressOwned( sitePurchases );
};

export const shouldShowPaywallNotice = ( state: object, siteId: number | null ): boolean => {
	return (
		! hasSupportedCommercialUse( state, siteId ) && getShouldShowPaywallNotice( state, siteId )
	);
};

export const shouldShowPaywallAfterGracePeriod = (
	state: object,
	siteId: number | null
): boolean => {
	// Make the paywall check more robust by checking the purchase.
	return (
		! hasSupportedCommercialUse( state, siteId ) &&
		getShouldShowPaywallAfterGracePeriod( state, siteId )
	);
};

const getPurchasesBySiteId = createSelector(
	( state, siteId ) => getSitePurchases( state, siteId ),
	getPurchases
);

export default function useStatsPurchases( siteId: number | null ) {
	const sitePurchases = useSelector( ( state ) => getPurchasesBySiteId( state, siteId ) );
	const isRequestingSitePurchases = useSelector( isFetchingSitePurchases );
	const hasLoadedSitePurchases = useSelector( hasLoadedSitePurchasesFromServer );

	// Determine whether a product is owned.
	// TODO we need to do plan check as well, because Stats products would be built into other plans.
	const isFreeOwned = useMemo( () => {
		return isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_FREE );
	}, [ sitePurchases ] );

	const isCommercialOwned = useMemo(
		() => isCommercialPurchaseOwned( sitePurchases ),
		[ sitePurchases ]
	);

	const isPWYWOwned = useMemo( () => {
		return isProductOwned( sitePurchases, PRODUCT_JETPACK_STATS_PWYW_YEARLY );
	}, [ sitePurchases ] );

	const supportCommercialUse = useMemo(
		() => supportCommercialPurchaseUse( sitePurchases ),
		[ sitePurchases ]
	);

	// Which specific bundled plan (if any) is granting commercial Stats access, so purchase-page
	// copy can name it instead of saying "your current plan".
	const isCompletePlanOwned = useMemo( () => hasCompletePlan( sitePurchases ), [ sitePurchases ] );
	const isGrowthPlanOwned = useMemo( () => hasGrowthPlan( sitePurchases ), [ sitePurchases ] );
	const isBusinessPlanOwned = useMemo( () => hasBusinessPlan( sitePurchases ), [ sitePurchases ] );

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
		isCompletePlanOwned,
		isGrowthPlanOwned,
		isBusinessPlanOwned,
		isLegacyCommercialLicense,
		hasLoadedSitePurchases,
		hasAnyPlan: isFreeOwned || isCommercialOwned || isPWYWOwned || supportCommercialUse,
		hasAnyStatsPlan: isCommercialOwned || isPWYWOwned || isFreeOwned,
		isLoading: ! hasLoadedSitePurchases || isRequestingSitePurchases,
	};
}

export const withStatsPurchases = ( WrappedComponent: ComponentClass ) => {
	function WithStatsPurchases( props: { siteId: number | null } ) {
		const statsPurchases = useStatsPurchases( props.siteId );
		return <WrappedComponent { ...props } { ...statsPurchases } />;
	}
	return WithStatsPurchases;
};
