/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getCurrencyFormatDecimal } from 'woocommerce/lib/currency';
import PriceInput from 'woocommerce/components/price-input';
import FormField from './form-field';

const CurrencyField = ( props ) => {
	const { fieldName, explanationText, placeholderText, value, edit, currency } = props;
	const renderedValue = ( 'undefined' !== typeof value && null !== value ? value : '' );

	const onChange = ( e ) => {
		const newValue = e.target.value;
		if ( 0 === newValue.length ) {
			edit( fieldName, '' );
			return;
		}

		const numberValue = Number( newValue );
		if ( 0 <= Number( newValue ) ) {
			const formattedValue = getCurrencyFormatDecimal( numberValue, currency );
			edit( fieldName, String( formattedValue ) );
		}
	};

	return (
		<FormField { ...props } >
			<PriceInput
				htmlFor={ fieldName + '-label' }
				aria-describedby={ explanationText && fieldName + '-description' }
				currency={ currency }
				value={ renderedValue }
				placeholder={ placeholderText }
				onChange={ onChange }
			/>
		</FormField>
	);
};

CurrencyField.PropTypes = {
	fieldName: PropTypes.string.isRequired,
	explanationText: PropTypes.string,
	placeholderText: PropTypes.string,
	value: PropTypes.number,
	edit: PropTypes.func.isRequired,
	currency: PropTypes.string.isRequired,
};

export default CurrencyField;

