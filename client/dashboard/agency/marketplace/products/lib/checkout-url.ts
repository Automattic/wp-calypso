import { wpcomLink } from '../../../../utils/link';
import { MARKETPLACE_REFERRAL_CHECKOUT_ROUTE, WPCOM_AGENCY_CHECKOUT_PATH } from '../../paths';
import type { ShoppingCartItem } from '../use-shopping-cart';

// Regular carts pay on the WordPress.com checkout. Referral carts stay in the
// dashboard, on the referral checkout route.
export function getCheckoutUrl( items: ShoppingCartItem[], isReferralMode: boolean ): string {
	if ( isReferralMode ) {
		return MARKETPLACE_REFERRAL_CHECKOUT_ROUTE;
	}

	const products = items
		.map( ( item ) => `${ encodeURIComponent( item.slug ) }:${ item.quantity }` )
		.join( ',' );
	return wpcomLink( `${ WPCOM_AGENCY_CHECKOUT_PATH }?products=${ products }` );
}
