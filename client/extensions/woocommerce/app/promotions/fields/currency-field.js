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

const CurrencyField = ( props ) => {
	const { fieldName, explanationText, placeholderText, value, edit, currency } = props;
	const renderedValue = 'undefined' !== typeof value && null !== value ? value : '';

	const onChange = ( e ) => {
		const newValue = e.target.value;
		edit( fieldName, String( newValue ) );
	};

	return (
		<FormField { ...props }>
			<PriceInput
				noWrap
				size="4"
				id={ fieldName + '-label' }
				aria-describedby={ explanationText && fieldName + '-description' }
				currency={ currency }
				value={ renderedValue }
				placeholder={ placeholderText }
				onChange={ onChange }
			/>
		</FormField>
	);
};

CurrencyField.propTypes = {
	fieldName: PropTypes.string,
	explanationText: PropTypes.string,
	placeholderText: PropTypes.string,
	value: PropTypes.string,
	edit: PropTypes.func,
	currency: PropTypes.string,
};

export default CurrencyField;
