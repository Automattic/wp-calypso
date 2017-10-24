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

const TextField = ( {
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
		edit( fieldName, newValue );
	};

	return (
		<FormField
			fieldName={ fieldName }
			labelText={ labelText }
			explanationText={ explanationText }
			isRequired={ isRequired }
		>
			<FormTextInput
				htmlFor={ fieldName + '-label' }
				aria-describedby={ explanationText && fieldName + '-description' }
				value={ renderedValue }
				placeholder={ placeholderText }
				onChange={ onChange }
			/>
		</FormField>
	);
};

TextField.PropTypes = {
	fieldName: PropTypes.string.isRequired,
	labelText: PropTypes.string.isRequired,
	explanationText: PropTypes.string,
	placeholderText: PropTypes.string,
	isRequired: PropTypes.bool.isRequired,
	value: PropTypes.number,
	edit: PropTypes.func.isRequired,
};

export default TextField;

