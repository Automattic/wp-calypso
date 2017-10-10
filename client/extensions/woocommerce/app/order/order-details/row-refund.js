/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';
import { getOrderRefundTotal } from 'woocommerce/lib/order-values';

class OrderRefundRow extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			refunds: PropTypes.array.isRequired,
		} ),
		showTax: PropTypes.bool,
	};

	render() {
		const { order, showTax, translate } = this.props;
		const refundValue = order.refunds.length ? getOrderRefundTotal( order ) : false;
		if ( ! refundValue ) {
			return null;
		}

		return (
			<div className="order-details__total-refund">
				<div className="order-details__totals-label">{ translate( 'Refunded' ) }</div>
				{ showTax && <div className="order-details__totals-tax" /> }
				<div className="order-details__totals-value">
					{ formatCurrency( refundValue, order.currency ) }
				</div>
			</div>
		);
	}
}

export default localize( OrderRefundRow );
