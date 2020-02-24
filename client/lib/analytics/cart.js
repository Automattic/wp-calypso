/**
 * External dependencies
 */

import { differenceWith, get, isEqual, each, omit } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { costToUSD } from 'lib/analytics/utils';
import { getAllCartItems } from 'lib/cart-values/cart-items';
import { recordAddToCart as recordAddToCartTracking, recordOrder } from 'lib/analytics/ad-tracking';

export function recordEvents( previousCart, nextCart ) {
	const previousItems = getAllCartItems( previousCart );
	const nextItems = getAllCartItems( nextCart );

	each( differenceWith( nextItems, previousItems, isEqual ), recordAddEvent );
	each( differenceWith( previousItems, nextItems, isEqual ), recordRemoveEvent );
}

function removeNestedProperties( cartItem ) {
	return omit( cartItem, [ 'extra' ] );
}

function recordAddEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_add', removeNestedProperties( cartItem ) );
	analytics.recordAddToCart( { cartItem } );
}

function recordRemoveEvent( cartItem ) {
	analytics.tracks.recordEvent( 'calypso_cart_product_remove', removeNestedProperties( cartItem ) );
}

export function recordUnrecognizedPaymentMethod( action ) {
	const payment = get( action, 'payment' );

	const eventArgs = {
		payment_method: get( payment, 'paymentMethod', 'missing' ),
		extra: JSON.stringify( payment ? omit( payment, 'paymentMethod' ) : action ),
	};

	analytics.tracks.recordEvent( 'calypso_cart_unrecognized_payment_method', eventArgs );
}

export function recordAddToCart( { cartItem } ) {
	// TODO: move Tracks event here?
	// Google Analytics
	const usdValue = costToUSD( cartItem.cost, cartItem.currency );
	analytics.ga.recordEvent(
		'Checkout',
		'calypso_cart_product_add',
		'',
		usdValue ? usdValue : undefined
	);
	// Marketing
	recordAddToCartTracking( cartItem );
}

export function recordPurchase( { cart, orderId } ) {
	if ( cart.total_cost >= 0.01 ) {
		// Google Analytics
		const usdValue = costToUSD( cart.total_cost, cart.currency );
		analytics.ga.recordEvent(
			'Purchase',
			'calypso_checkout_payment_success',
			'',
			usdValue ? usdValue : undefined
		);
		// Marketing
		recordOrder( cart, orderId );
	}
}
