/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormField from './form-field';

const PercentField = ( props ) => {
	const { fieldName, explanationText, placeholderText, value, edit } = props;
	const renderedValue = 'undefined' !== typeof value ? value : '';

	const onChange = ( e ) => {
		const newValue = e.target.value;
		if ( newValue >= 0 && newValue <= 100 ) {
			edit( fieldName, newValue );
		}
	};

	return (
		<FormField { ...props }>
			<FormTextInputWithAffixes
				id={ fieldName + '-label' }
				aria-describedby={ explanationText && fieldName + '-description' }
				type="number"
				min="0"
				max="100"
				suffix="%"
				placeholder={ placeholderText || '10' }
				value={ renderedValue }
				onChange={ onChange }
			/>
		</FormField>
	);
};

PercentField.propTypes = {
	fieldName: PropTypes.string,
	explanationText: PropTypes.string,
	placeholderText: PropTypes.string,
	value: PropTypes.string,
	edit: PropTypes.func,
};

export default PercentField;
