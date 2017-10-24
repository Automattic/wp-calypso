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
		<FormSettingExplanation>{ explanationText }</FormSettingExplanation>
	);

	return (
		<FormFieldset>
			<FormLabel>{ labelText }</FormLabel> { requiredLabel }
			{ children }
			{ explanation }
		</FormFieldset>
	);
};

FormField.PropTypes = {
	labelText: PropTypes.string.isRequired,
	explanationText: PropTypes.string,
	isRequired: PropTypes.bool.isRequired,
	children: PropTypes.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( FormField );
