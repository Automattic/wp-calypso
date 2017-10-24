/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

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
	translate,
} ) => {
	const requiredLabel = ( isRequired &&
		<span className="fields__form-label-required">
			{ translate( 'Required' ) }
		</span>
	);

	const explanation = ( explanationText &&
		<FormSettingExplanation id={ fieldName + '-description' }>
			{ explanationText }
		</FormSettingExplanation>
	);

	return (
		<FormFieldset>
			<FormLabel id={ fieldName + '-label' }>
				{ labelText } { requiredLabel }
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
	isRequired: PropTypes.bool.isRequired,
	children: PropTypes.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( FormField );
