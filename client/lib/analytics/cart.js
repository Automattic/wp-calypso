/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { recordAddToCart } from 'calypso/lib/analytics/record-add-to-cart';

function removeNestedProperties( cartItem ) {
	return omit( cartItem, [ 'extra' ] );
}

export function recordAddEvent( cartItem ) {
	recordTracksEvent( 'calypso_cart_product_add', removeNestedProperties( cartItem ) );
	recordAddToCart( { cartItem } );
}
