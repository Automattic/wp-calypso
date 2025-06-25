import { fetchSitePurchases } from '../../data/site-purchases';
import type { Purchase } from '../../data/site-purchases';

export const siteHasCancelablePurchasesQuery = ( siteId: number, userId: number ) => ( {
	queryKey: [ 'site', siteId, 'purchases', 'has-cancelable' ],
	queryFn: () => fetchSitePurchases( siteId ),
	select: ( purchases: Purchase[] ) => {
		const cancelables = purchases
			.filter( ( purchase ) => {
				// Exclude inactive purchases and legacy premium theme purchases.
				if ( ! purchase.active || purchase.product_slug === 'premium_theme' ) {
					return false;
				}

				return purchase.is_cancelable;
			} )
			.filter( ( purchase ) => Number( purchase.user_id ) === userId );

		return cancelables.length > 0;
	},
} );
