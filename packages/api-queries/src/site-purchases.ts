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
