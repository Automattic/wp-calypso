import { queryOptions } from '@tanstack/react-query';
import { fetchSitePurchases } from '../../data/site-purchases';

/**
 * TODO: standardize on either number (site ID) or string (site slug) for
 * these queries to make sure caching behaves correctly. ID is the most
 * reliable since it will never be affected by custom domains. However,
 * sometimes all we have is the site slug from the URL.
 */

export const siteHasCancelablePurchasesQuery = ( siteId: number | string, userId: number ) =>
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

export const sitePurchaseQuery = ( siteId: number | string, purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases', purchaseId ],
		queryFn: () => fetchSitePurchases( siteId ),
		select: ( purchases ) => purchases.find( ( p ) => parseInt( p.ID ) === purchaseId ),
	} );

export const sitePurchasesQuery = ( siteId: number | string ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'purchases' ],
		queryFn: () => fetchSitePurchases( siteId ),
	} );
