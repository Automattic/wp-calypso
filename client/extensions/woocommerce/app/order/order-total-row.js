/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';

class OrderTotalRow extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			currency: PropTypes.string.isRequired,
			total: PropTypes.string.isRequired,
			total_tax: PropTypes.string.isRequired,
		} ),
		showTax: PropTypes.bool,
	};

	render() {
		const { order, showTax, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const tax = (
			<div className="order__details-totals-tax">
				{ formatCurrency( order.total_tax, order.currency ) }
			</div>
		);

		return (
			<div className="order__details-total">
				<div className="order__details-totals-label">
					{ translate( 'Total' ) }
				</div>
				{ showTax && tax }
				<div className="order__details-totals-value">
					{ formatCurrency( order.total, order.currency ) }
				</div>
			</div>
		);
	}
}

export default localize( OrderTotalRow );
