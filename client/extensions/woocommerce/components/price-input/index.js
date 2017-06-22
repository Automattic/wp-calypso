/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormTextInput from 'components/forms/form-text-input';
import { getCurrencyObject } from 'lib/format-currency';

const PriceInput = ( { value, currency, ...props } ) => {
	const currencyObject = getCurrencyObject( value, currency );
	if ( ! currencyObject ) {
		return (
			<FormTextInput
				value={ value }
				{ ...props } />
		);
	}

	return (
		<FormCurrencyInput
			currencySymbolPrefix={ currencyObject.symbol }
			value={ value }
			{ ...props } />
	);
};

PriceInput.propTypes = {
	value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
	currency: PropTypes.string.isRequired,
};

export default PriceInput;
