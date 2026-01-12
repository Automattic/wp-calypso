import { fetchSitePurchases, Purchase } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

/**
 * Filters purchases to find cancelable ones for a specific user.
 * A purchase is cancelable if it's refundable or not a legacy premium theme.
 */
function getCancelablePurchases( purchases: Purchase[], userId: number ): Purchase[] {
	return purchases
		.filter( ( purchase ) => {
			if ( purchase.is_refundable ) {
				return true;
			}

			// Exclude legacy premium theme purchases.
			return purchase.product_slug !== 'premium_theme';
		} )
		.filter( ( purchase ) => purchase.user_id === userId );
}

export const siteHasCancelablePurchasesQuery = ( siteId: number, userId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases', 'has-cancelable' ],
		queryFn: () => fetchSitePurchases( siteId ),
		select: ( purchases ) => {
			const cancelables = getCancelablePurchases( purchases, userId );
			return cancelables.length > 0;
		},
	} );

export interface SiteDeletionPurchaseInfo {
	/** Whether the site has any cancelable purchases */
	hasCancelablePurchases: boolean;
	/** Whether all cancelable purchases are trial plans (only meaningful if hasCancelablePurchases is true) */
	hasOnlyTrialPurchases: boolean;
}

/**
 * Query to get purchase information relevant to site deletion.
 * Returns whether the site has cancelable purchases and whether they are all trials.
 */
export const siteDeletionPurchaseInfoQuery = ( siteId: number, userId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases', 'deletion-info' ],
		queryFn: () => fetchSitePurchases( siteId ),
		select: ( purchases ): SiteDeletionPurchaseInfo => {
			const cancelables = getCancelablePurchases( purchases, userId );
			const hasCancelablePurchases = cancelables.length > 0;
			const hasOnlyTrialPurchases =
				hasCancelablePurchases && cancelables.every( ( purchase ) => purchase.is_trial_plan );

			return {
				hasCancelablePurchases,
				hasOnlyTrialPurchases,
			};
		},
	} );
