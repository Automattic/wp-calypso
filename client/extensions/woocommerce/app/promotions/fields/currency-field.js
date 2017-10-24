/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
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
		// TODO: Round to correct decimal number count (e.g. 2.505 -> 2.51).
		if ( newValue >= 0 ) {
			edit( fieldName, newValue );
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

