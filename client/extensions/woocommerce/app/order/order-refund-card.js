/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import formatCurrency from 'lib/format-currency';
import OrderDetailsTable from './order-details-table';

class OrderRefundCard extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			discount_total: PropTypes.string.isRequired,
			line_items: PropTypes.array.isRequired,
			payment_method_title: PropTypes.string.isRequired,
			shipping_total: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
		} ),
	}

	state = {
		showRefundDialog: false,
	}

	getRefundedTotal = ( order ) => {
		return order.refunds.reduce( ( sum, i ) => sum + ( i.total * 1 ), 0 );
	}

	toggleRefundDialog = () => {
		this.setState( {
			showRefundDialog: ! this.state.showRefundDialog,
		} );
	}

	onChange = () => {
		// console.log( 'change' );
	}

	render() {
		const { order, translate } = this.props;
		let refundStatus = translate( 'Payment of %(total)s received via %(method)s', {
			args: {
				total: formatCurrency( order.total, order.currency ) || order.total,
				method: order.payment_method_title,
			}
		} );

		if ( 'refunded' === order.status ) {
			refundStatus = translate( 'Payment of %(total)s has been refunded', {
				args: {
					total: formatCurrency( order.total, order.currency ) || order.total,
				}
			} );
		} else if ( order.refunds.length ) {
			const refund = this.getRefundedTotal( order );
			refundStatus = translate( 'Payment of %(total)s has been partially refunded %(refund)s', {
				args: {
					total: formatCurrency( order.total, order.currency ) || order.total,
					refund: formatCurrency( refund, order.currency ) || refund,
				}
			} );
		}

		const dialogClass = 'woocommerce'; // eslint/css specificity hack

		return (
			<div className="order__details-refund">
				<div className="order__details-refund-label">
					<Gridicon icon="checkmark" />
					{ refundStatus }
				</div>
				<div className="order__details-refund-action">
					{ ( 'refunded' !== order.status )
						? <Button onClick={ this.toggleRefundDialog }>{ translate( 'Submit Refund' ) }</Button>
						: null
					}
				</div>

				<Dialog isVisible={ this.state.showRefundDialog } onClose={ this.toggleRefundDialog } className={ dialogClass }>
					<h1>{ translate( 'Refund order' ) }</h1>
					<OrderDetailsTable order={ order } onChange={ this.onChange } />
				</Dialog>
			</div>
		);
	}
}

export default localize( OrderRefundCard );
