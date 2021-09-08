import { omit } from 'lodash';
import { recordAddToCart } from 'calypso/lib/analytics/record-add-to-cart';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

function removeNestedProperties( cartItem ) {
	return omit( cartItem, [ 'extra' ] );
}

export function recordAddEvent( cartItem ) {
	recordTracksEvent( 'calypso_cart_product_add', removeNestedProperties( cartItem ) );
	recordAddToCart( { cartItem } );
}
