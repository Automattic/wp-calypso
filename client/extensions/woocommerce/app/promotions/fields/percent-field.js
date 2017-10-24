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

const PercentField = ( {
	fieldName,
	labelText,
	explanationText,
	placeholderText,
	isRequired,
	value,
	edit,
} ) => {
	const renderedValue = ( 'undefined' !== typeof value ? value : '' );

	const onChange = ( e ) => {
		const newValue = e.target.value;
		if ( newValue >= 0 && newValue <= 100 ) {
			edit( fieldName, newValue );
		}
	};

	return (
		<FormField
			fieldName={ fieldName }
			labelText={ labelText }
			explanationText={ explanationText }
			isRequired={ isRequired }
		>
			<FormTextInputWithAffixes
				htmlFor={ fieldName + '-label' }
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

PercentField.PropTypes = {
	fieldName: PropTypes.string.isRequired,
	labelText: PropTypes.string.isRequired,
	explanationText: PropTypes.string,
	placeholderText: PropTypes.string,
	isRequired: PropTypes.bool.isRequired,
	value: PropTypes.number,
	edit: PropTypes.func.isRequired,
};

export default PercentField;

