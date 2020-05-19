/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getOrderRefundTotal } from 'woocommerce/lib/order-values/totals';
import { isOrderFailed, isOrderWaitingPayment } from 'woocommerce/lib/order-status';
import RefundDialog from './dialog';
import { saveOrder } from 'woocommerce/state/sites/orders/actions';

class OrderPaymentCard extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			id: PropTypes.number.isRequired,
			payment_method_title: PropTypes.string.isRequired,
			refunds: PropTypes.array.isRequired,
			status: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
		} ),
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
		saveOrder: PropTypes.func.isRequired,
	};

	state = {
		showDialog: false,
	};

	getPaymentStatus = () => {
		const { order, translate } = this.props;
		let paymentStatus;

		if ( 'refunded' === order.status ) {
			paymentStatus = translate( 'Payment of %(total)s has been refunded', {
				args: {
					total: formatCurrency( order.total, order.currency ),
				},
			} );
		} else if ( 'on-hold' === order.status || 'pending' === order.status ) {
			if ( order.payment_method_title ) {
				paymentStatus = translate( 'Awaiting payment of %(total)s via %(method)s', {
					args: {
						total: formatCurrency( order.total, order.currency ),
						method: order.payment_method_title,
					},
				} );
			} else {
				paymentStatus = translate( 'Awaiting payment of %(total)s', {
					args: {
						total: formatCurrency( order.total, order.currency ),
					},
				} );
			}
		} else if ( order.refunds.length ) {
			const refund = getOrderRefundTotal( order );
			paymentStatus = translate( 'Payment of %(total)s has been partially refunded %(refund)s', {
				args: {
					total: formatCurrency( order.total, order.currency ),
					refund: formatCurrency( refund, order.currency ),
				},
			} );
		} else if ( 'cod' === order.payment_method && 'processing' === order.status ) {
			paymentStatus = translate( 'Payment of %(total)s on delivery', {
				args: {
					total: formatCurrency( order.total, order.currency ),
				},
			} );
		} else if ( order.payment_method_title ) {
			paymentStatus = translate( 'Payment of %(total)s received via %(method)s', {
				args: {
					total: formatCurrency( order.total, order.currency ),
					method: order.payment_method_title,
				},
			} );
		} else {
			paymentStatus = translate( 'Payment of %(total)s received', {
				args: {
					total: formatCurrency( order.total, order.currency ),
				},
			} );
		}
		return paymentStatus;
	};

	getPaymentAction = () => {
		const { order, translate } = this.props;
		const codProcessing = 'cod' === order.payment_method && 'processing' === order.status;
		if ( 'refunded' === order.status || codProcessing ) {
			return null;
		} else if ( isOrderWaitingPayment( order.status ) ) {
			return <Button onClick={ this.markAsPaid }>{ translate( 'Mark as paid' ) }</Button>;
		}
		return <Button onClick={ this.toggleDialog }>{ translate( 'Submit refund' ) }</Button>;
	};

	markAsPaid = () => {
		const { order, siteId } = this.props;
		this.props.saveOrder( siteId, { ...order, status: 'processing' } );
	};

	toggleDialog = () => {
		this.setState( ( prevState ) => ( {
			showDialog: ! prevState.showDialog,
		} ) );
	};

	render() {
		const { order } = this.props;

		if ( isOrderFailed( order.status ) ) {
			return null;
		}

		return (
			<div className="order-payment">
				<div className="order-payment__label">
					<Gridicon icon="checkmark" />
					{ this.getPaymentStatus() }
				</div>
				<div className="order-payment__action">{ this.getPaymentAction() }</div>

				<RefundDialog
					isVisible={ this.state.showDialog }
					order={ order }
					toggleDialog={ this.toggleDialog }
				/>
			</div>
		);
	}
}

export default connect( null, ( dispatch ) => bindActionCreators( { saveOrder }, dispatch ) )(
	localize( OrderPaymentCard )
);
