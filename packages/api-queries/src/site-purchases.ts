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

export const sitePurchaseQuery = ( siteId: number, purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases', purchaseId ],
		queryFn: () => fetchSitePurchases( siteId ),
		select: ( purchases ) => purchases.find( ( p ) => p.ID === purchaseId ),
	} );

export const sitePurchasesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases' ],
		queryFn: () => fetchSitePurchases( siteId ),
	} );
