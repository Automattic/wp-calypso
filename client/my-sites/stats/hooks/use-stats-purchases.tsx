import {
	JETPACK_COMPLETE_PLANS,
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
import { useSelector } from 'calypso/state';
import {
	isFetchingSitePurchases,
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	getPurchases,
} from 'calypso/state/purchases/selectors';
import {
	getPlanUsageBillableMonthlyViews,
	getCurrentUsagePastDays,
} from 'calypso/state/stats/plan-usage/selectors';
import { MIN_MONTHLY_VIEWS_TO_APPLY_PAYWALL } from './use-site-compulsory-plan-selection-qualified-check';
import type { Purchase } from 'calypso/lib/purchases/types';

const JETPACK_STATS_TIERED_BILLING_LIVE_DATE_2024_01_04 = '2024-01-04T05:30:00+00:00';
const JETPACK_STATS_PAYWALL_GRACE_PERIOD_DAYS = 7;

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
		[ PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY, ...JETPACK_COMPLETE_PLANS ].some(
			( plan ) => isProductOwned( ownedPurchases, plan )
		)
	);
};

const isVideoPressOwned = ( ownedPurchases: Purchase[] ) => {
	return areProductsOwned( ownedPurchases, [ ...JETPACK_VIDEOPRESS_PRODUCTS ] );
};

export const hasSupportedCommercialUse = ( state: object, siteId: number | null ) => {
	const sitePurchases = getSitePurchases( state, siteId );

	return supportCommercialPurchaseUse( sitePurchases );
};

export const hasSupportedVideoPressUse = ( state: object, siteId: number | null ) => {
	const sitePurchases = getSitePurchases( state, siteId );

	return isVideoPressOwned( sitePurchases );
};

export const hasReachedPaywallMonthlyViews = ( state: object, siteId: number | null ): boolean => {
	const billableMonthlyViews = getPlanUsageBillableMonthlyViews( state, siteId );

	return billableMonthlyViews >= MIN_MONTHLY_VIEWS_TO_APPLY_PAYWALL;
};

export const hasCurrentUsageOverGracePeriod = ( state: object, siteId: number | null ): boolean => {
	const currentUsagePastDays = getCurrentUsagePastDays( state, siteId );

	return currentUsagePastDays >= JETPACK_STATS_PAYWALL_GRACE_PERIOD_DAYS;
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
		hasLoadedSitePurchases,
		hasAnyPlan: isFreeOwned || isCommercialOwned || isPWYWOwned || supportCommercialUse,
		hasAnyStatsPlan: isCommercialOwned || isPWYWOwned || isFreeOwned,
		isLoading: ! hasLoadedSitePurchases || isRequestingSitePurchases,
	};
}

export const withStatsPurchases =
	( WrappedComponent: ComponentClass ) => ( props: { siteId: number | null } ) => {
		const statsPurchases = useStatsPurchases( props.siteId );
		return <WrappedComponent { ...props } { ...statsPurchases } />;
	};
