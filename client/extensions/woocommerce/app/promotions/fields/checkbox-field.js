/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormField from './form-field';

const CheckboxField = ( props ) => {
	const { fieldName, explanationText, placeholderText, value, edit } = props;
	const renderedValue = 'undefined' !== typeof value ? value : false;

	const onChange = () => {
		edit( fieldName, ! value );
	};

	return (
		<FormField { ...omit( props, 'explanationText' ) }>
			<FormCheckbox
				id={ fieldName + '-label' }
				aria-describedby={ explanationText && fieldName + '-description' }
				checked={ renderedValue }
				placeholder={ placeholderText }
				onChange={ onChange }
			/>
			<span>{ explanationText }</span>
		</FormField>
	);
};

CheckboxField.propTypes = {
	fieldName: PropTypes.string,
	explanationText: PropTypes.string,
	placeholderText: PropTypes.string,
	value: PropTypes.bool,
	edit: PropTypes.func,
};

export default CheckboxField;
