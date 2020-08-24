/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FieldError from '../field-error';

const PriceField = ( { id, title, value, placeholder, updateValue, error, className } ) => {
	const handleChangeEvent = ( event ) => updateValue( event.target.value );

	return (
		<FormFieldset className={ className }>
			<FormLabel htmlFor={ id }>{ title }</FormLabel>
			<FormCurrencyInput
				id={ id }
				name={ id }
				currencySymbolPrefix={ '$' }
				placeholder={ placeholder || '0.00' }
				value={ value }
				onChange={ handleChangeEvent }
				isError={ Boolean( error ) }
			/>
			{ error && typeof error === 'string' && <FieldError text={ error } /> }
		</FormFieldset>
	);
};

PriceField.propTypes = {
	id: PropTypes.string.isRequired,
	title: PropTypes.node,
	value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
	placeholder: PropTypes.string,
	updateValue: PropTypes.func,
	error: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
	className: PropTypes.string,
};

export default PriceField;
