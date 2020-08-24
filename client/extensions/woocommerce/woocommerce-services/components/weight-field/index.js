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
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FieldError from '../field-error';

const WeightField = ( {
	id,
	title,
	value,
	placeholder,
	updateValue,
	error,
	className,
	weightUnit,
} ) => {
	const handleChangeEvent = ( event ) => updateValue( event.target.value );

	return (
		<FormFieldset className={ className }>
			<FormLabel htmlFor={ id }>{ title }</FormLabel>
			<FormTextInputWithAffixes
				noWrap
				suffix={ weightUnit }
				id={ id }
				name={ id }
				type="number"
				placeholder={ placeholder || '0.0' }
				value={ value }
				onChange={ handleChangeEvent }
				isError={ Boolean( error ) }
			/>
			{ error && typeof error === 'string' && <FieldError text={ error } /> }
		</FormFieldset>
	);
};

WeightField.propTypes = {
	weightUnit: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	title: PropTypes.node,
	value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
	placeholder: PropTypes.string,
	updateValue: PropTypes.func,
	error: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
	className: PropTypes.string,
};

export default WeightField;
