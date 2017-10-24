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

const CurrencyField = ( {
	fieldName,
	labelText,
	explanationText,
	placeholderText,
	isRequired,
	value,
	edit,
	currency,
} ) => {
	const renderedValue = ( 'undefined' !== typeof value ? value : '' );

	const onChange = ( e ) => {
		const newValue = e.target.value;
		if ( 0 === newValue.length ) {
			edit( fieldName, '' );
			return;
		}

		const numberValue = Number( newValue );
		if ( 0 <= Number( newValue ) ) {
			const formattedValue = getCurrencyFormatDecimal( numberValue, currency );
			edit( fieldName, formattedValue );
		}
	};

	return (
		<FormField
			labelText={ labelText }
			explanationText={ explanationText }
			isRequired={ isRequired }
		>
			<PriceInput
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
	labelText: PropTypes.string.isRequired,
	explanationText: PropTypes.string,
	placeholderText: PropTypes.string,
	isRequired: PropTypes.bool.isRequired,
	value: PropTypes.number,
	edit: PropTypes.func.isRequired,
	currency: PropTypes.string.isRequired,
};

export default CurrencyField;

