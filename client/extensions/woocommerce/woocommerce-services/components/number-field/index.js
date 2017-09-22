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
import NumberInput from './number-input';
import FieldError from '../field-error';
import FieldDescription from '../field-description';

const parseNumber = ( value ) => {
	if ( '' === value ) {
		return 0;
	}
	const float = Number.parseFloat( value );
	return isNaN( float ) ? value : float;
};

const NumberField = ( { id, title, description, value, placeholder, updateValue, error, className } ) => {
	const onChange = ( event ) => updateValue( parseNumber( event.target.value ) );

	return (
		<FormFieldset className={ className }>
			<FormLabel htmlFor={ id }>{ title }</FormLabel>
			<NumberInput
				id={ id }
				name={ id }
				placeholder={ placeholder }
				value={ value }
				onChange={ onChange }
				isError={ Boolean( error ) }
			/>
			{ error ? <FieldError text={ error } /> : <FieldDescription text={ description } /> }
		</FormFieldset>
	);
};

NumberField.propTypes = {
	id: PropTypes.string.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
	value: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.number,
	] ).isRequired,
	updateValue: PropTypes.func,
	error: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.bool,
	] ),
	className: PropTypes.string,
};

export default NumberField;
