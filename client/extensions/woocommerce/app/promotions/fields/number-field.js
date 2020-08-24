/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';
import FormField from './form-field';

const NumberField = ( props ) => {
	const { fieldName, explanationText, placeholderText, value, edit, minValue, maxValue } = props;
	const renderedValue = 'undefined' !== typeof value && null !== value ? value : '';

	const onChange = ( e ) => {
		const newValue = e.target.value;

		if ( 'undefined' !== minValue && newValue < minValue ) {
			return;
		}
		if ( 'undefined' !== maxValue && newValue > maxValue ) {
			return;
		}

		edit( fieldName, String( newValue ) );
	};

	return (
		<FormField { ...props }>
			<FormTextInput
				id={ fieldName + '-label' }
				aria-describedby={ explanationText && fieldName + '-description' }
				type="number"
				min={ minValue }
				max={ maxValue }
				placeholder={ placeholderText || '10' }
				value={ renderedValue }
				onChange={ onChange }
			/>
		</FormField>
	);
};

NumberField.propTypes = {
	fieldName: PropTypes.string,
	explanationText: PropTypes.string,
	placeholderText: PropTypes.string,
	value: PropTypes.number,
	minValue: PropTypes.number,
	maxValue: PropTypes.number,
	edit: PropTypes.func,
};

export default NumberField;
