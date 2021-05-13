/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormFieldAnnotation from 'calypso/my-sites/checkout/composite-checkout/components/form-field-annotation';
import FormCountrySelect from 'calypso/components/forms/form-country-select';

export default function CountrySelectMenu( {
	translate,
	onChange,
	isDisabled,
	isError,
	errorMessage,
	currentValue,
	countriesList,
} ) {
	const countrySelectorId = 'country-selector';
	const countrySelectorLabelId = 'country-selector-label';
	const countrySelectorDescriptionId = 'country-selector-description';

	return (
		<FormFieldAnnotation
			labelText={ translate( 'Country' ) }
			isError={ isError }
			isDisabled={ isDisabled }
			formFieldId={ countrySelectorId }
			labelId={ countrySelectorLabelId }
			descriptionId={ countrySelectorDescriptionId }
			errorDescription={ errorMessage }
		>
			<FormCountrySelect
				id={ countrySelectorId }
				countriesList={ [
					{ code: '', name: translate( 'Select Country' ) },
					{ code: null, name: '' },
					...countriesList,
				] }
				onChange={ onChange }
				disabled={ isDisabled }
				value={ currentValue }
				aria-labelledby={ countrySelectorLabelId }
				aria-describedby={ countrySelectorDescriptionId }
			/>
		</FormFieldAnnotation>
	);
}
