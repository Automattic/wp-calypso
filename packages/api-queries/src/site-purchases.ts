import { queryOptions } from '@tanstack/react-query';
import { sitePurchasesQuery } from './upgrades';

export const siteHasCancelablePurchasesQuery = ( siteId: number, userId: number ) =>
	queryOptions( {
		...sitePurchasesQuery( siteId ),
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
