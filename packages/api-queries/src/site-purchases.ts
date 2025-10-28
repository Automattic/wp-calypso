import { fetchSitePurchases } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteHasCancelablePurchasesQuery = ( siteId: number, userId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases', 'has-cancelable' ],
		queryFn: () => fetchSitePurchases( siteId ),
		select: ( purchases ) => {
			const cancelables = purchases
				.filter( ( purchase ) => {
					// Exclude inactive purchases and legacy premium theme purchases.
					if ( purchase.expiry_status === 'expired' || purchase.product_slug === 'premium_theme' ) {
						return false;
					}

					return purchase.is_cancelable;
				} )
				.filter( ( purchase ) => purchase.user_id === userId );

			return cancelables.length > 0;
		},
	} );
