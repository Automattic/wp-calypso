import { fetchSitePurchases } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

const baseSitePurchasesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases' ],
		queryFn: () => fetchSitePurchases( siteId ),
	} );

export const siteHasCancelablePurchasesQuery = ( siteId: number, userId: number ) =>
	queryOptions( {
		...baseSitePurchasesQuery( siteId ),
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

export const siteHasPurchasesThatBlockSiteDeletionQuery = ( siteId: number ) =>
	queryOptions( {
		...baseSitePurchasesQuery( siteId ),
		select: ( purchases ) => purchases.some( ( purchase ) => purchase.blocks_site_deletion ),
	} );
