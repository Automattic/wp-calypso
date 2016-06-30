/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal Dependencies
 **/
import { getCurrencyObject } from 'lib/format-currency';

export default class PlanFeaturesPrice extends Component {

	render() {
		const { currencyCode, rawPrice, original, discounted } = this.props;
		if ( ! currencyCode || ( rawPrice !== 0 && ! rawPrice ) ) {
			return null;
		}
		const price = getCurrencyObject( rawPrice, currencyCode );
		const classes = classNames( 'plan-features__price', {
			'is-original': original,
			'is-discounted': discounted
		} );
		return (
			<h4 className={ classes }>
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
	original: PropTypes.bool,
	discount: PropTypes.bool,
	currencyCode: PropTypes.string
};

PlanFeaturesPrice.defaultProps = {
	currencyCode: 'USD',
	original: false,
	discounted: false
};
