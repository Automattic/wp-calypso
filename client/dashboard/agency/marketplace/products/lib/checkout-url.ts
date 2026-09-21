import { a4aLink } from '../../../../utils/link';
import { CLASSIC_MARKETPLACE_CHECKOUT_PATH, MARKETPLACE_PRODUCTS_ROUTE } from '../../paths';
import type { ShoppingCartItem } from '../use-shopping-cart';

// The classic checkout reads the products from the URL, but only takes the
// purchase mode from its own session, so referral carts go through the
// classic products page in referral mode instead.
export function getCheckoutUrl( items: ShoppingCartItem[], isReferralMode: boolean ): string {
	if ( isReferralMode ) {
		const products = items
			.map( ( item ) => `${ encodeURIComponent( item.slug ) }:${ item.quantity }` )
			.join( ',' );
		return a4aLink(
			`${ MARKETPLACE_PRODUCTS_ROUTE }?products=${ products }&purchase_type=referral`
		);
	}

	const productSlugs = items.map( ( item ) => encodeURIComponent( item.slug ) ).join( ',' );
	return a4aLink( `${ CLASSIC_MARKETPLACE_CHECKOUT_PATH }?product_slug=${ productSlugs }` );
}
