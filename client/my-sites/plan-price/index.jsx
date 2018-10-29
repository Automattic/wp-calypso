/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal Dependencies
 **/
import formatCurrency, { getCurrencyObject } from 'lib/format-currency';

export default class PlanPrice extends Component {
	render() {
		const {
			currencyCode,
			rawPrice,
			original,
			discounted,
			className,
			isInSignup,
			shouldShowTax,
			taxRate,
		} = this.props;

		if ( ! currencyCode || ( rawPrice !== 0 && ! rawPrice ) ) {
			return null;
		}
		const price = getCurrencyObject( rawPrice, currencyCode );
		const classes = classNames( 'plan-price', className, {
			'is-original': original,
			'is-discounted': discounted,
		} );
		const displayTax = taxRate
			? `+${ formatCurrency( rawPrice * taxRate, currencyCode, { symbol: '' } ) } tax`
			: '+tax';

		if ( isInSignup ) {
			return (
				<span className={ classes }>
					{ price.symbol }
					{ price.integer }
					{ rawPrice - price.integer > 0 && price.fraction }
				</span>
			);
		}

		return (
			<h4 className={ classes }>
				<sup className="plan-price__currency-symbol">{ price.symbol }</sup>
				<span className="plan-price__integer">{ price.integer }</span>
				<sup className="plan-price__fraction">
					{ rawPrice - price.integer > 0 && price.fraction }
				</sup>
				{ shouldShowTax && <sup className="plan-price__tax">{ displayTax }</sup> }
			</h4>
		);
	}
}

PlanPrice.propTypes = {
	rawPrice: PropTypes.number,
	original: PropTypes.bool,
	discounted: PropTypes.bool,
	currencyCode: PropTypes.string,
	className: PropTypes.string,
	shouldShowTax: PropTypes.bool,
	taxRate: PropTypes.number,
};

PlanPrice.defaultProps = {
	currencyCode: 'USD',
	original: false,
	discounted: false,
	className: '',
	shouldShowTax: false,
	taxRate: undefined,
};
