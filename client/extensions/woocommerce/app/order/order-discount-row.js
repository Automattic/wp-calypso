/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';

class OrderDiscountRow extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			discount_tax: PropTypes.string.isRequired,
			discount_total: PropTypes.string.isRequired,
		} ),
	}

	render() {
		const { order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		return (
			<div className="order__details-total-discount">
				<div className="order__details-totals-label">{ translate( 'Discount' ) }</div>
				<div className="order__details-totals-tax">
					{ formatCurrency( order.discount_tax, order.currency ) || order.discount_tax }
				</div>
				<div className="order__details-totals-value">
					{ formatCurrency( order.discount_total, order.currency ) || order.discount_total }
				</div>
			</div>
		);
	}
}

export default localize( OrderDiscountRow );
