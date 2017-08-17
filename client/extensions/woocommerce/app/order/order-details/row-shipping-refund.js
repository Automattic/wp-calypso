/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import PriceInput from 'woocommerce/components/price-input';

class OrderShippingRefundRow extends Component {
	static propTypes = {
		currency: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,
		shippingTotal: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number,
		] ).isRequired,
	}

	render() {
		const {
			currency,
			onChange,
			shippingTotal,
			translate
		} = this.props;

		return (
			<div className="order-details__total-shipping-refund">
				<div className="order-details__totals-label">{ translate( 'Shipping' ) }</div>
				<div className="order-details__totals-value">
					<PriceInput
						name="shipping_total"
						onChange={ onChange }
						currency={ currency }
						value={ shippingTotal } />
				</div>
			</div>
		);
	}
}

export default localize( OrderShippingRefundRow );
