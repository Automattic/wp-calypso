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
import { getCurrencyDefaults } from 'lib/format-currency';
import PriceInput from 'woocommerce/components/price-input';

class OrderShippingRefundRow extends Component {
	static propTypes = {
		currency: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,
		shippingTotal: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
	};

	render() {
		const { currency, numberFormat, onChange, shippingTotal, translate } = this.props;
		const { decimal, grouping, precision } = getCurrencyDefaults( currency );
		const total = numberFormat( Math.abs( shippingTotal ), {
			decimals: precision,
			decPoint: decimal,
			thousandsSep: grouping,
		} );

		return (
			<div className="order-details__total-shipping-refund">
				<div className="order-details__totals-label">{ translate( 'Shipping' ) }</div>
				<div className="order-details__totals-value">
					<PriceInput
						name="shipping_total"
						onChange={ onChange }
						currency={ currency }
						value={ total }
					/>
				</div>
			</div>
		);
	}
}

export default localize( OrderShippingRefundRow );
