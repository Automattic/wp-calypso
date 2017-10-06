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
import { getOrderTotalTax } from 'woocommerce/lib/order-taxes';

class OrderTotalRow extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
		} ),
		showTax: PropTypes.bool,
	};

	render() {
		const { order, showTax, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const taxValue = getOrderTotalTax( order );
		const tax = (
			<div className="order-details__totals-tax">
				{ formatCurrency( taxValue, order.currency ) }
			</div>
		);

		return (
			<div className="order-details__total">
				<div className="order-details__totals-label">{ translate( 'Total' ) }</div>
				{ showTax && tax }
				<div className="order-details__totals-value">
					{ formatCurrency( order.total, order.currency ) }
				</div>
			</div>
		);
	}
}

export default localize( OrderTotalRow );
