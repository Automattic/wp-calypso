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
import FormSettingExplanation from 'components/forms/form-setting-explanation';

const FormField = ( {
	fieldName,
	labelText,
	explanationText,
	isRequired,
	children,
} ) => {
	const explanation = ( explanationText &&
		<FormSettingExplanation id={ fieldName + '-description' }>
			{ explanationText }
		</FormSettingExplanation>
	);

	return (
		<FormFieldset>
			<FormLabel id={ fieldName + '-label' } required={ isRequired }>
				{ labelText }
			</FormLabel>
			{ children }
			{ explanation }
		</FormFieldset>
	);
};

FormField.PropTypes = {
	fieldName: PropTypes.string.isRequired,
	labelText: PropTypes.string.isRequired,
	explanationText: PropTypes.string,
	isRequired: PropTypes.bool,
	children: PropTypes.isRequired,
};

export default FormField;
