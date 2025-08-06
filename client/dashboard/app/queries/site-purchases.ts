import { queryOptions } from '@tanstack/react-query';
import { fetchSitePurchases } from '../../data/site-purchases';

export const siteHasCancelablePurchasesQuery = ( siteId: string, userId: string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases', 'has-cancelable' ],
		queryFn: () => fetchSitePurchases( siteId ),
		select: ( purchases ) => {
			const cancelables = purchases
				.filter( ( purchase ) => {
					// Exclude inactive purchases and legacy premium theme purchases.
					if (
						purchase.subscription_status !== 'active' ||
						purchase.expiry_status === 'expired' ||
						purchase.product_slug === 'premium_theme'
					) {
						return false;
					}

					return purchase.is_cancelable;
				} )
				.filter( ( purchase ) => String( purchase.user_id ) === userId );

			return cancelables.length > 0;
		},
	} );

export const sitePurchaseQuery = ( siteId: string, purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases', purchaseId ],
		queryFn: () => fetchSitePurchases( siteId ),
		select: ( purchases ) => purchases.find( ( p ) => String( p.ID ) === String( purchaseId ) ),
	} );

export const sitePurchasesQuery = ( siteId: string ) =>
	queryOptions( {
		queryKey: [ 'me', 'purchases', siteId ],
		queryFn: () => fetchSitePurchases( siteId ),
	} );
