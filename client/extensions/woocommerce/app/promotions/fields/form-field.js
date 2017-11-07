/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

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
} ) => {
	const isValueValid = ! ( 'undefined' === typeof value );
	const showChildren = ( isEnableable ? isValueValid : true );

	const explanation = ( explanationText &&
		<FormSettingExplanation id={ fieldName + '-description' }>
			{ explanationText }
		</FormSettingExplanation>
	);

	let enableCheckbox = null;

	if ( isEnableable ) {
		const enableCheckboxChanged =
			() => edit( fieldName, ( isValueValid ? undefined : ( defaultValue || null ) ) );

		enableCheckbox = (
			<FormCheckbox
				checked={ isValueValid }
				onChange={ enableCheckboxChanged }
			/>
		);
	}

	const childrenClassNames = classNames(
		'fields__fieldset-children',
		{ 'fields__fieldset-children-enableable': enableCheckbox }
	);

	const formLabel = ( enableCheckbox || labelText ) && (
		<FormLabel htmlFor={ enableCheckbox ? null : `${ fieldName }-label` } required={ isRequired }>
			{ enableCheckbox }
			{ labelText }
		</FormLabel>
	);

	return (
		<FormFieldset className="fields__fieldset">
			{ formLabel }
			<div className={ childrenClassNames }>
				{ showChildren && children }
				{ explanation }
			</div>
		</FormFieldset>
	);
};

FormField.PropTypes = {
	fieldName: PropTypes.string.isRequired,
	labelText: PropTypes.string,
	explanationText: PropTypes.string,
	isRequired: PropTypes.bool,
	isEnableable: PropTypes.bool,
	defaultValue: PropTypes.any,
	children: PropTypes.isRequired,
};

export default FormField;
