/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal Dependencies
 **/
import { getCurrencyObject } from 'lib/format-currency';

export default class PlanFeaturesPrice extends Component {

	render() {
		const { currencyCode, rawPrice } = this.props;
		const price = getCurrencyObject( rawPrice, currencyCode );
		return (
			<h4 className="plan-features__price">
				<sup className="plan-features__price-currency-symbol">
					{ price.symbol }
				</sup>
				<span className="plan-features__price-integer">
					{ price.integer }
				</span>
				<sup className="plan-features__price-fraction">
					{ rawPrice > 0 && price.fraction }
				</sup>
			</h4>
		);
	}
}

PlanFeaturesPrice.propTypes = {
	rawPrice: PropTypes.number,
	currencyCode: PropTypes.string
};

PlanFeaturesPrice.defaultProps = {
	currencyCode: 'USD'
};
