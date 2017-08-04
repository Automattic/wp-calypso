/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

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
			shippingTotal
		} = this.props;

		return (
			<div className="order__details-total-shipping-refund">
				<div className="order__details-totals-value">
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

export default OrderShippingRefundRow;
