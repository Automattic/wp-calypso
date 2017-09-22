/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

function OrderStatus( { showPayment = true, showShipping = true, status, translate } ) {
	const classes = `order-status__item is-${ status }`;
	let paymentLabel;
	let shippingLabel;
	switch ( status ) {
		case 'pending':
			shippingLabel = translate( 'New order' );
			paymentLabel = translate( 'Payment pending' );
			break;
		case 'processing':
			shippingLabel = translate( 'New order' );
			paymentLabel = translate( 'Paid in full' );
			break;
		case 'on-hold':
			shippingLabel = translate( 'On hold' );
			paymentLabel = translate( 'Payment pending' );
			break;
		case 'completed':
			shippingLabel = translate( 'Fulfilled' );
			paymentLabel = translate( 'Paid in full' );
			break;
		case 'cancelled':
			paymentLabel = translate( 'Cancelled' );
			break;
		case 'refunded':
			paymentLabel = translate( 'Refunded' );
			break;
		case 'failed':
			paymentLabel = translate( 'Payment failed' );
			break;
	}

	return (
		<span className={ classes }>
			{ ( shippingLabel && showShipping ) ? <span className="order-status__shipping">{ shippingLabel }</span> : null }
			{ showPayment ? <span className="order-status__payment">{ paymentLabel }</span> : null }
		</span>
	);
}

export default localize( OrderStatus );
