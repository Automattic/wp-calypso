import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import FormTextInput from 'calypso/components/forms/form-text-input';
import CountrySelectMenu from 'calypso/my-sites/checkout/composite-checkout/components/country-select-menu';
import FormFieldAnnotation from 'calypso/my-sites/checkout/composite-checkout/components/form-field-annotation';
import {
	LeftColumn,
	RightColumn,
} from 'calypso/my-sites/checkout/composite-checkout/components/ie-fallback';
import useCountryList from 'calypso/my-sites/checkout/composite-checkout/hooks/use-country-list';

const GridRow = styled.div`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: 48% 4% 48%;
	grid-template-columns: 48% 48%;
	grid-column-gap: 4%;
	justify-items: stretch;
`;

const FieldRow = styled( GridRow )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

const RenderEditFormFields = ( {
	onChangePostalCode,
	onChangeCountryCode,
	postalCodeValue,
	countryCodeValue,
}: {
	value?: string;
	onChangePostalCode: unknown;
	onChangeCountryCode: unknown;
	postalCodeValue?: string;
	countryCodeValue?: string;
} ): JSX.Element => {
	const countriesList = useCountryList( [] );
	const translate = useTranslate();

	const arePostalCodesSupported = getCountryPostalCodeSupport(
		countriesList,
		countryCodeValue ?? ''
	);

	return (
		<>
			<FieldRow>
				<LeftColumn>
					<CountrySelectMenu
						translate={ translate }
						onChange={ onChangeCountryCode }
						isError={ false }
						isDisabled={ false }
						errorMessage={ '' }
						currentValue={ countryCodeValue || '' }
						countriesList={ countriesList }
					/>
				</LeftColumn>
				{ arePostalCodesSupported && (
					<RightColumn>
						<FormFieldAnnotation
							labelText={ translate( 'Postal code', { textOnly: true } ) }
							formFieldId="tax_postal_code"
							labelId="tax_postal_code_label"
							descriptionId="tax_postal_code_label"
							errorDescription=""
						>
							<FormTextInput
								id="tax_postal_code"
								name="tax_postal_code"
								placeholder="Enter postal code"
								value={ postalCodeValue || '' }
								onChange={ onChangePostalCode }
							/>
						</FormFieldAnnotation>
					</RightColumn>
				) }
			</FieldRow>
		</>
	);
};

export default RenderEditFormFields;
