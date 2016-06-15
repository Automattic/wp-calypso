/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';

/**
 * Internal Dependencies
 **/
import currencyFormatter, { findCurrency } from 'lib/currency-formatter';

function currencyFormatOptions( defaults, showDecimal = true ) {
	const options = { code: defaults.code };
	const space = defaults.spaceBetweenAmountAndSymbol ? '\u00a0' : '';

	options.format = `<sup class="plan-features__price-currency-symbol">%s</sup>${ space }%v`;

	if ( ! defaults.symbolOnLeft && showDecimal ) {
		options.format = `%v</sup>${ space }<sup class="plan-features__price-currency-symbol">%s</sup>`;
	} else if ( ! defaults.symbolOnLeft ) {
		options.format = `%v${ space }<sup class="plan-features__price-currency-symbol">%s</sup>`;
	} else if ( defaults.symbolOnLeft && showDecimal ) {
		options.format = `<sup class="plan-features__price-currency-symbol">%s</sup>${ space }%v</sup>`;
	}

	if ( showDecimal ) {
		options.decimal = `<sup class="plan-features__price-cents">${ defaults.decimalSeparator }`; //open sup is closed by format string
	} else {
		options.precision = 0;
	}
	return options;
}

export default class PlanFeaturesPrice extends Component {

	render() {
		const { currencyCode, rawPrice } = this.props;
		const defaults = findCurrency( currencyCode );
		const priceHTML = currencyFormatter( rawPrice, currencyFormatOptions( defaults, rawPrice !== 0 ) );
		/*eslint-disable react/no-danger*/
		return (
			<h4 className="plan-features__price" dangerouslySetInnerHTML={ { __html: priceHTML } } />
		);
		/*eslint-enable react/no-danger*/
	}
}

PlanFeaturesPrice.propTypes = {
	rawPrice: PropTypes.number,
	currencyCode: PropTypes.string
};

PlanFeaturesPrice.defaultProps = {
	currencyCode: 'USD'
};
