/** @format */

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
import FormToggleInput from 'components/token-field';
import FieldError from '../field-error';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const TokenField = ( {
	id,
	title,
	description,
	value,
	placeholder,
	updateValue,
	error,
	className,
	suggestions,
	saveTransform,
	displayTransform,
} ) => {
	return (
		<FormFieldset className={ className }>
			<FormLabel htmlFor={ id }>{ title }</FormLabel>
			<FormToggleInput
				id={ id }
				name={ id }
				placeholder={ placeholder }
				value={ value }
				onChange={ updateValue }
				isError={ Boolean( error ) }
				suggestions={ suggestions }
				saveTransform={ saveTransform }
				displayTransform={ displayTransform }
			/>
			{ error && typeof error === 'string' && <FieldError text={ error } /> }
			{ ! error && description && <FormSettingExplanation>{ description }</FormSettingExplanation> }
		</FormFieldset>
	);
};

TokenField.propTypes = {
	id: PropTypes.string.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
	value: PropTypes.array.isRequired,
	updateValue: PropTypes.func,
	error: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
	className: PropTypes.string,
	suggestions: PropTypes.array,
	displayTransform: PropTypes.func,
	saveTransform: PropTypes.func,
};

export default TokenField;
