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
import parseNumber from 'woocommerce/woocommerce-services/lib/utils/parse-number';
import FieldError from 'woocommerce/woocommerce-services/components/field-error';
import FieldDescription from 'woocommerce/woocommerce-services/components/field-description';
import sanitizeHTML from 'woocommerce/woocommerce-services/lib/utils/sanitize-html';

const NumberField = ( {
	id,
	title,
	description,
	value,
	placeholder,
	updateValue,
	error,
	className,
} ) => {
	const onChange = ( event ) => updateValue( parseNumber( event.target.value ) );

	return (
		<FormFieldset className={ className }>
			<FormLabel htmlFor={ id } dangerouslySetInnerHTML={ sanitizeHTML( title ) } />
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
	value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
	updateValue: PropTypes.func,
	error: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
	className: PropTypes.string,
};

export default NumberField;
