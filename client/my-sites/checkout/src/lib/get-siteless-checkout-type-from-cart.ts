import type { ResponseCart, SitelessCheckoutType } from '@automattic/shopping-cart';

/**
 * The siteless checkout type of a renewal reached by subscription ID alone,
 * whose URL does not say which kind of purchase it is. The server flags a
 * renewal of a purchase on a holding site with that holding site's type.
 */
export function getSitelessCheckoutTypeFromCart(
	responseCart: Pick< ResponseCart, 'products' >
): SitelessCheckoutType {
	for ( const product of responseCart.products ) {
		if ( product.extra.isAkismetSitelessCheckout ) {
			return 'akismet';
		}
		if ( product.extra.isMarketplaceSitelessCheckout ) {
			return 'marketplace';
		}
		if ( product.extra.isWpcomSitelessCheckout ) {
			return 'wpcom';
		}
	}
	return undefined;
}
