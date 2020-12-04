/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';

const FormField = ( {
	fieldName,
	labelText,
	explanationText,
	isRequired,
	isEnableable,
	defaultValue,
	children,
	value,
	edit,
	validationErrorText,
} ) => {
	const isValueValid = ! ( 'undefined' === typeof value );
	const showChildren = isEnableable ? isValueValid : true;

	const explanation = explanationText && (
		<FormSettingExplanation id={ fieldName + '-description' }>
			{ explanationText }
		</FormSettingExplanation>
	);

	let enableCheckbox = null;

	if ( isEnableable ) {
		const enableCheckboxChanged = () =>
			edit( fieldName, isValueValid ? undefined : defaultValue || null );

		enableCheckbox = <FormCheckbox checked={ isValueValid } onChange={ enableCheckboxChanged } />;
	}

	const childrenClassNames = classNames( 'fields__fieldset-children', {
		'fields__fieldset-children-enableable': enableCheckbox,
	} );

	const formLabel = ( enableCheckbox || labelText ) && (
		<FormLabel htmlFor={ enableCheckbox ? null : `${ fieldName }-label` } required={ isRequired }>
			{ enableCheckbox }
			{ labelText }
		</FormLabel>
	);

	const validationError = validationErrorText && (
		<FormInputValidation isError text={ validationErrorText } />
	);

	return (
		<FormFieldset className="fields__fieldset">
			{ formLabel }
			<div className={ childrenClassNames }>
				{ showChildren && children }
				{ explanation }
			</div>
			{ showChildren && validationError }
		</FormFieldset>
	);
};

FormField.propTypes = {
	fieldName: PropTypes.string,
	labelText: PropTypes.string,
	explanationText: PropTypes.string,
	isRequired: PropTypes.bool,
	isEnableable: PropTypes.bool,
	defaultValue: PropTypes.any,
	validationErrorText: PropTypes.string,
};

export default FormField;
