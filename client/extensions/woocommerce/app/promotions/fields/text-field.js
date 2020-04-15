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

const TextField = ( props ) => {
	const { fieldName, explanationText, placeholderText, value, edit } = props;
	const renderedValue = 'undefined' !== typeof value ? value : '';

	const onChange = ( e ) => {
		const newValue = e.target.value;
		edit( fieldName, newValue );
	};

	return (
		<FormField { ...props }>
			<FormTextInput
				id={ fieldName + '-label' }
				aria-describedby={ explanationText && fieldName + '-description' }
				value={ renderedValue }
				placeholder={ placeholderText }
				onChange={ onChange }
			/>
		</FormField>
	);
};

TextField.propTypes = {
	fieldName: PropTypes.string,
	explanationText: PropTypes.string,
	placeholderText: PropTypes.string,
	value: PropTypes.string,
	edit: PropTypes.func,
};

export default TextField;
