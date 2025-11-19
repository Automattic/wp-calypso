import { fetchSitePurchases } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const siteHasCancelablePurchasesQuery = ( siteId: number, userId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases', 'has-cancelable' ],
		queryFn: () => fetchSitePurchases( siteId ),
		select: ( purchases ) => {
			const cancelables = purchases
				.filter( ( purchase ) => {
					if ( purchase.is_refundable ) {
						return true;
					}

					// Exclude legacy premium theme purchases.
					return purchase.product_slug !== 'premium_theme';
				} )
				.filter( ( purchase ) => purchase.user_id === userId );

			return cancelables.length > 0;
		},
	} );
