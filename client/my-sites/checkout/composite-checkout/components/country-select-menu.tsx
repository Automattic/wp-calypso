import { useTranslate } from 'i18n-calypso';
import FormCountrySelect from 'calypso/components/forms/form-country-select';
import FormFieldAnnotation from 'calypso/my-sites/checkout/composite-checkout/components/form-field-annotation';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { HTMLProps, ReactChild } from 'react';

export default function CountrySelectMenu( {
	translate,
	onChange,
	isDisabled,
	isError,
	errorMessage,
	currentValue,
	countriesList,
}: {
	translate: ReturnType< typeof useTranslate >;
	onChange: HTMLProps< HTMLSelectElement >[ 'onChange' ];
	isDisabled?: boolean;
	isError?: boolean;
	errorMessage?: ReactChild;
	currentValue: HTMLProps< HTMLSelectElement >[ 'value' ];
	countriesList: CountryListItem[];
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
					{ code: '', name: translate( 'Select Country' ), has_postal_codes: false },
					{ code: '', name: '', has_postal_codes: false },
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
