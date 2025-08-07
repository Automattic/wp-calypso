import { queryOptions } from '@tanstack/react-query';
import { fetchSitePurchases } from '../../data/site-purchases';

export const siteHasCancelablePurchasesQuery = ( siteId: number, userId: number ) =>
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
				.filter( ( purchase ) => purchase.user_id === String( userId ) );

			return cancelables.length > 0;
		},
	} );

export const sitePurchaseQuery = ( siteId: number, purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases', purchaseId ],
		queryFn: () => fetchSitePurchases( siteId ),
		select: ( purchases ) => purchases.find( ( p ) => parseInt( p.ID ) === purchaseId ),
	} );

export const sitePurchasesQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases' ],
		queryFn: () => fetchSitePurchases( siteId ),
	} );
