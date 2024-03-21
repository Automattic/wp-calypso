import config from '@automattic/calypso-config';
import {
	Field,
	tryToGuessPostalCodeFormat,
	getCountryPostalCodeSupport,
	getCountryTaxRequirements,
	CountryTaxRequirements,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import {
	getStateLabelText,
	STATE_SELECT_TEXT,
} from 'calypso/components/domains/contact-details-form-fields/custom-form-fieldsets/utils';
import { StateSelect } from 'calypso/my-sites/domains/components/form';
import { isValid } from '../types/wpcom-store-state';
import CountrySelectMenu from './country-select-menu';
import { LeftColumn, RightColumn } from './ie-fallback';
import { VatForm } from './vat-form';
import type {
	CountryListItem,
	ManagedContactDetails,
	ManagedContactDetailsTldExtraFieldsShape,
	ManagedValue,
} from '@automattic/wpcom-checkout';
import type { ChangeEvent, ReactElement } from 'react';

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

export default function TaxFields( {
	section,
	taxInfo,
	countriesList,
	onChange,
	allowVat,
	isDisabled,
}: {
	section: string;
	taxInfo: ManagedContactDetails;
	countriesList: CountryListItem[];
	onChange: ( taxInfo: ManagedContactDetails ) => void;
	allowVat?: boolean;
	isDisabled?: boolean;
} ) {
	const translate = useTranslate();
	const { postalCode, countryCode, city, state, organization, address1, tldExtraFields } = taxInfo;
	const arePostalCodesSupported =
		countriesList.length && countryCode?.value
			? getCountryPostalCodeSupport( countriesList, countryCode.value )
			: false;
	const taxRequirements =
		countriesList.length && countryCode?.value
			? getCountryTaxRequirements( countriesList, countryCode?.value )
			: {};
	const isUnitedStateWithBusinessOption = ( () => {
		const zipCode = postalCode?.value ? parseInt( postalCode.value, 10 ) : 0;
		if ( zipCode >= 43000 && zipCode <= 45999 ) {
			// Ohio; OH
			return true;
		}
		if ( ( zipCode >= 6000 && zipCode <= 6389 ) || ( zipCode >= 6391 && zipCode <= 6999 ) ) {
			// Connecticut; CT
			return true;
		}
		return false;
	} )();
	const isBusinessCheckboxNeeded = countryCode?.value === 'US' && isUnitedStateWithBusinessOption;
	const isVatSupported = config.isEnabled( 'checkout/vat-form' ) && allowVat;

	const fields: ReactElement[] = [
		<CountrySelectMenu
			onChange={ ( event: ChangeEvent< HTMLSelectElement > ) => {
				onChange(
					updateOnChangePayload(
						{
							countryCode: { value: event.target.value, errors: [], isTouched: true },
							postalCode: updatePostalCodeForCountry( postalCode, countryCode, countriesList ),
							city,
							state,
							organization,
							address: address1,
							isForBusiness: tldExtraFields?.isForBusiness,
						},
						arePostalCodesSupported,
						taxRequirements
					)
				);
			} }
			isError={ countryCode?.isTouched && ! isValid( countryCode ) }
			isDisabled={ isDisabled }
			errorMessage={ countryCode?.errors?.[ 0 ] ?? translate( 'This field is required.' ) }
			currentValue={ countryCode?.value }
			countriesList={ countriesList }
		/>,
	];
	if ( arePostalCodesSupported ) {
		fields.push(
			<Field
				id={ section + '-postal-code' }
				type="text"
				label={ String( translate( 'Postal code' ) ) }
				value={ postalCode?.value ?? '' }
				disabled={ isDisabled }
				onChange={ ( newValue: string ) => {
					onChange(
						updateOnChangePayload(
							{
								countryCode,
								postalCode: updatePostalCodeForCountry(
									{ value: newValue.toUpperCase(), errors: [], isTouched: true },
									countryCode,
									countriesList
								),
								city,
								state,
								organization,
								address: address1,
								isForBusiness: tldExtraFields?.isForBusiness,
							},
							arePostalCodesSupported,
							taxRequirements
						)
					);
				} }
				autoComplete={ section + ' postal-code' }
				isError={ postalCode?.isTouched && ! isValid( postalCode ) }
				errorMessage={
					postalCode?.errors?.[ 0 ] ?? String( translate( 'This field is required.' ) )
				}
			/>
		);
	}
	if ( taxRequirements.city ) {
		fields.push(
			<Field
				id={ section + '-city' }
				type="text"
				label={ String( translate( 'City' ) ) }
				value={ city?.value ?? '' }
				disabled={ isDisabled }
				onChange={ ( newValue: string ) => {
					onChange(
						updateOnChangePayload(
							{
								countryCode,
								postalCode,
								city: { value: newValue, errors: [], isTouched: true },
								state,
								organization,
								address: address1,
								isForBusiness: tldExtraFields?.isForBusiness,
							},
							arePostalCodesSupported,
							taxRequirements
						)
					);
				} }
				autoComplete={ section + ' city' }
				isError={ city?.isTouched && ! isValid( city ) }
				errorMessage={ city?.errors?.[ 0 ] ?? String( translate( 'This field is required.' ) ) }
			/>
		);
	}
	if ( taxRequirements.subdivision ) {
		fields.push(
			<StateSelect
				label={ getStateLabelText( countryCode?.value ?? '' ) }
				countryCode={ countryCode?.value }
				selectText={ STATE_SELECT_TEXT[ countryCode?.value ?? '' ] }
				value={ state?.value }
				onChange={ ( event: ChangeEvent< HTMLSelectElement > ) => {
					onChange(
						updateOnChangePayload(
							{
								countryCode,
								postalCode,
								city,
								state: { value: event.target.value, errors: [], isTouched: true },
								organization,
								address: address1,
								isForBusiness: tldExtraFields?.isForBusiness,
							},
							arePostalCodesSupported,
							taxRequirements
						)
					);
				} }
			/>
		);
	}
	if ( taxRequirements.organization ) {
		fields.push(
			<Field
				id={ section + '-organization' }
				type="text"
				label={ String( translate( 'Organization' ) ) }
				value={ organization?.value ?? '' }
				disabled={ isDisabled }
				onChange={ ( newValue: string ) => {
					onChange(
						updateOnChangePayload(
							{
								countryCode,
								postalCode,
								city,
								state,
								organization: { value: newValue, errors: [], isTouched: true },
								address: address1,
								isForBusiness: tldExtraFields?.isForBusiness,
							},
							arePostalCodesSupported,
							taxRequirements
						)
					);
				} }
				autoComplete="organization"
			/>
		);
	}
	if ( taxRequirements.address ) {
		fields.push(
			<Field
				id={ section + '-taxes-address' }
				type="text"
				label={ String( translate( 'Address' ) ) }
				value={ address1?.value ?? '' }
				disabled={ isDisabled }
				onChange={ ( newValue: string ) => {
					onChange(
						updateOnChangePayload(
							{
								countryCode,
								postalCode,
								city,
								state,
								organization,
								address: { value: newValue, errors: [], isTouched: true },
								isForBusiness: tldExtraFields?.isForBusiness,
							},
							arePostalCodesSupported,
							taxRequirements
						)
					);
				} }
				autoComplete="address"
			/>
		);
	}
	if ( isBusinessCheckboxNeeded ) {
		fields.push(
			<CheckboxControl
				id={ section + '-business-checkbox' }
				label={ translate( 'Is this purchase for business?', { textOnly: true } ) }
				checked={ tldExtraFields?.isForBusiness ?? false }
				disabled={ isDisabled }
				onChange={ ( newValue ) => {
					onChange(
						updateOnChangePayload(
							{
								countryCode,
								postalCode,
								city,
								state,
								organization,
								address: address1,
								isForBusiness: newValue,
							},
							arePostalCodesSupported,
							taxRequirements
						)
					);
				} }
			/>
		);
	}

	return (
		<>
			{ fields
				.filter( ( field, index ) => index % 2 === 0 )
				.map( ( field, index ) => (
					<FieldRow key={ index }>
						<LeftColumn>{ field }</LeftColumn>
						{ fields[ index * 2 + 1 ] && <RightColumn>{ fields[ index * 2 + 1 ] }</RightColumn> }
					</FieldRow>
				) ) }
			{ isVatSupported && (
				<VatForm section={ section } isDisabled={ isDisabled } countryCode={ countryCode?.value } />
			) }
		</>
	);
}

function updateOnChangePayload(
	taxInfo: {
		countryCode: ManagedContactDetails[ 'countryCode' ] | undefined;
		postalCode: ManagedContactDetails[ 'postalCode' ] | undefined;
		city: ManagedContactDetails[ 'city' ] | undefined;
		state: ManagedContactDetails[ 'state' ] | undefined;
		organization: ManagedContactDetails[ 'organization' ] | undefined;
		address: ManagedContactDetails[ 'address1' ] | undefined;
		isForBusiness?: ManagedContactDetailsTldExtraFieldsShape< boolean >[ 'isForBusiness' ];
	},
	arePostalCodesSupported: boolean,
	taxRequirements: CountryTaxRequirements
): ManagedContactDetails {
	return {
		countryCode: taxInfo.countryCode,
		postalCode: arePostalCodesSupported ? taxInfo.postalCode : undefined,
		city: taxRequirements.city ? taxInfo.city : undefined,
		state: taxRequirements.subdivision ? taxInfo.state : undefined,
		organization: taxRequirements.organization ? taxInfo.organization : undefined,
		address1: taxRequirements.address ? taxInfo.address : undefined,
		tldExtraFields: {
			isForBusiness: taxInfo.isForBusiness ?? false,
		},
	};
}

function updatePostalCodeForCountry(
	postalCode: ManagedValue | undefined,
	countryCode: ManagedValue | undefined,
	countriesList: CountryListItem[]
): ManagedValue | undefined {
	const arePostalCodesSupported =
		countriesList.length && countryCode?.value
			? getCountryPostalCodeSupport( countriesList, countryCode.value )
			: false;
	if ( ! arePostalCodesSupported ) {
		return { value: '', errors: [], isTouched: true };
	}
	// Reformat the postal code if the country changes
	if ( postalCode?.value ) {
		const formattedPostalCodeValue = tryToGuessPostalCodeFormat(
			postalCode.value,
			countryCode?.value
		);
		return { value: formattedPostalCodeValue, errors: [], isTouched: true };
	}
	return postalCode;
}
