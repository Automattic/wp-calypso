/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

export class OrderStatus extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			payment_method: PropTypes.string,
			status: PropTypes.string.isRequired,
		} ),
		showPayment: PropTypes.bool,
		showShipping: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	getPaymentLabel = () => {
		const { order, translate } = this.props;
		const { status, payment_method, refunds = [] } = order;
		switch ( status ) {
			case 'pending':
			case 'on-hold':
				return translate( 'Payment pending' );
			case 'processing':
				if ( 'cod' === payment_method ) {
					return translate( 'Paid on delivery' );
				}
				if ( refunds.length > 0 ) {
					return translate( 'Partially refunded' );
				}
				return translate( 'Paid in full' );
			case 'completed':
				if ( refunds.length > 0 ) {
					return translate( 'Partially refunded' );
				}
				return translate( 'Paid in full' );
			case 'cancelled':
				return translate( 'Cancelled' );
			case 'refunded':
				return translate( 'Refunded' );
			case 'failed':
				return translate( 'Payment failed' );
		}
		return false;
	};

	getShippingLabel = () => {
		const { order, translate } = this.props;
		switch ( order.status ) {
			case 'pending':
			case 'processing':
				return translate( 'New order' );
			case 'on-hold':
				return translate( 'On hold' );
			case 'completed':
				return translate( 'Fulfilled' );
		}
		return false;
	};

	render() {
		const {
			order: { status },
			showPayment = true,
			showShipping = true,
		} = this.props;
		const classes = `order-status__item is-${ status }`;
		const paymentLabel = this.getPaymentLabel();
		const shippingLabel = this.getShippingLabel();

		// Status was unrecognized, there is no label content to display
		if ( ! shippingLabel && ! paymentLabel ) {
			return null;
		}

		return (
			<span className={ classes }>
				{ shippingLabel && showShipping ? (
					<span className="order-status__shipping">{ shippingLabel }</span>
				) : null }
				{ showPayment ? <span className="order-status__payment">{ paymentLabel }</span> : null }
			</span>
		);
	}
}

export default localize( OrderStatus );
