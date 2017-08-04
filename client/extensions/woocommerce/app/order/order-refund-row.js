/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';

class OrderRefundRow extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			refunds: PropTypes.array.isRequired,
		} ),
	}

	getRefundedTotal = ( order ) => {
		return order.refunds.reduce( ( total, i ) => total + ( i.total * 1 ), 0 );
	}

	render() {
		const { order, translate } = this.props;
		const refundValue = order.refunds.length ? this.getRefundedTotal( order ) : false;
		if ( ! refundValue ) {
			return null;
		}

		return (
			<div className="order__details-total-refund">
				<div className="order__details-totals-label">{ translate( 'Refunded' ) }</div>
				<div className="order__details-totals-tax"></div>
				<div className="order__details-totals-value">
					{ formatCurrency( refundValue, order.currency ) || refundValue }
				</div>
			</div>
		);
	}
}

export default localize( OrderRefundRow );
