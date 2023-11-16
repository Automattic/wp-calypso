import { TranslateResult, useTranslate } from 'i18n-calypso';
import FormCountrySelect from 'calypso/components/forms/form-country-select';
import FormFieldAnnotation from 'calypso/my-sites/checkout/src/components/form-field-annotation';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { HTMLProps } from 'react';

export default function CountrySelectMenu( {
	onChange,
	isDisabled,
	isError,
	errorMessage,
	currentValue,
	countriesList,
}: {
	onChange: HTMLProps< HTMLSelectElement >[ 'onChange' ];
	isDisabled?: boolean;
	isError?: boolean;
	errorMessage?: TranslateResult;
	currentValue: HTMLProps< HTMLSelectElement >[ 'value' ];
	countriesList: CountryListItem[];
} ) {
	const countrySelectorId = 'country-selector';
	const countrySelectorLabelId = 'country-selector-label';
	const countrySelectorDescriptionId = 'country-selector-description';
	const translate = useTranslate();

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
					{
						code: '',
						name: translate( 'Select Country' ),
						has_postal_codes: false,
						vat_supported: false,
					},
					{ code: '', name: '', has_postal_codes: false, vat_supported: false },
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
