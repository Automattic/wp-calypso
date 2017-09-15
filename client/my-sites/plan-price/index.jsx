/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal Dependencies
 **/
import { getCurrencyObject } from 'lib/format-currency';

export default class PlanPrice extends Component {

	render() {
		const {
			currencyCode,
			rawPrice,
			original,
			discounted,
			className,
			isInSignup,
		} = this.props;

		if ( ! currencyCode || ( rawPrice !== 0 && ! rawPrice ) ) {
			return null;
		}
		const price = getCurrencyObject( rawPrice, currencyCode );
		const classes = classNames( 'plan-price', className, {
			'is-original': original,
			'is-discounted': discounted
		} );

		if ( isInSignup ) {
			return (
				<span className={ classes }>{ price.symbol }{ price.integer }{ rawPrice > 0 && price.fraction }</span>
			);
		}

		return (
			<h4 className={ classes }>
				<sup className="plan-price__currency-symbol">
					{ price.symbol }
				</sup>
				<span className="plan-price__integer">
					{ price.integer }
				</span>
				<sup className="plan-price__fraction">
					{ rawPrice > 0 && price.fraction }
				</sup>
			</h4>
		);
	}
}

PlanPrice.propTypes = {
	rawPrice: PropTypes.number,
	original: PropTypes.bool,
	discounted: PropTypes.bool,
	currencyCode: PropTypes.string,
	className: PropTypes.string
};

PlanPrice.defaultProps = {
	currencyCode: 'USD',
	original: false,
	discounted: false,
	className: ''
};
