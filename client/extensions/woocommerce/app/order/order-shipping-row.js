/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';

class OrderShippingRow extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			shipping_tax: PropTypes.string.isRequired,
			shipping_total: PropTypes.string.isRequired,
		} ),
	}

	render() {
		const { order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		return (
			<div className="order__details-total-shipping">
				<div className="order__details-totals-label">{ translate( 'Shipping' ) }</div>
				<div className="order__details-totals-tax">
					{ formatCurrency( order.shipping_tax, order.currency ) }
				</div>
				<div className="order__details-totals-value">
					{ formatCurrency( order.shipping_total, order.currency ) }
				</div>
			</div>
		);
	}
}

export default localize( OrderShippingRow );
