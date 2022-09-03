import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormPhoneMediaInput from 'calypso/components/forms/form-phone-media-input';
import InfoPopover from 'calypso/components/info-popover';
import { paymentMethodName } from 'calypso/lib/cart-values';
import { PAYMENT_PROCESSOR_COUNTRIES_FIELDS } from 'calypso/lib/checkout/constants';
import { StateSelect, Input, HiddenInput } from 'calypso/my-sites/domains/components/form';
import { CountrySpecificPaymentField } from './country-specific-payment-field';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { PropsWithChildren } from 'react';

export type CountrySpecificPaymentFieldsProps = {
	countriesList: CountryListItem[];
	countryCode: string;
	disableFields?: boolean;
	getErrorMessages: ( fieldName: string ) => string[];
	getFieldValue: ( fieldName: string ) => string;
	handleFieldChange: ( fieldName: string, newValue: string ) => void;
};

export const CountrySpecificPaymentFields = styled( CountrySpecificPaymentFieldsUnstyled )`
	margin-top: 0;

	& .checkout__form-info-text {
		display: none;
	}

	& .document,
	& .phone,
	& .postal-code,
	& .checkout__form-state-field {
		flex-basis: auto;
	}

	& .checkout__checkout-field,
	& .checkout__form-state-field {
		margin-left: 0;
	}

	& .checkout__form-info-text,
	& .form__hidden-input a {
		margin-left: 0;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.bigPhoneUp } ) {
		& .address-1,
		& .state {
			margin-right: 15px;
		}
	}
`;

function getFieldNamesForCountry( countryCode: string ): string[] {
	if ( countryCode === 'IN' || countryCode === 'BR' ) {
		return PAYMENT_PROCESSOR_COUNTRIES_FIELDS[ countryCode ]?.fields ?? [];
	}
	return [];
}

function OnlyAllowedField( {
	fieldName,
	allowedFieldNames,
	children,
}: PropsWithChildren< {
	fieldName: string;
	allowedFieldNames: string[];
} > ): JSX.Element | null {
	if ( ! allowedFieldNames.includes( fieldName ) ) {
		return null;
	}
	return <>{ children }</>;
}

function CountrySpecificPaymentFieldsUnstyled( {
	countriesList,
	countryCode,
	disableFields,
	getErrorMessages,
	getFieldValue,
	handleFieldChange,
}: CountrySpecificPaymentFieldsProps ) {
	const [ phoneCountryCode, setPhoneCountryCode ] = useState( '' );
	const fieldNames = getFieldNamesForCountry( countryCode );
	const translate = useTranslate();

	const handlePhoneFieldChange = ( {
		value,
		countryCode: newPhoneCountryCode,
	}: {
		value: string;
		countryCode: string;
	} ) => {
		handleFieldChange( 'phone-number', value );
		setPhoneCountryCode( newPhoneCountryCode );
	};

	const getPanNumberPopover = () => {
		const popoverText = translate( 'Paying with %(indiaPaymentMethods)s requires a PAN number.', {
			comment: 'indiaPaymentMethods are local payment methods in India.',
			args: {
				indiaPaymentMethods: paymentMethodName( 'netbanking' ),
			},
		} );
		return (
			<InfoPopover position="right" className="checkout__pan-number-popover">
				{ popoverText }
			</InfoPopover>
		);
	};

	const countryData = countriesList.find(
		( countryElement ) => countryElement.code === countryCode
	);
	const countryName = countryData && countryData.name ? countryData.name : '';
	const containerClassName = classNames(
		'checkout__country-payment-fields',
		`checkout__country-${ countryCode.toLowerCase() }`
	);

	return (
		<div className={ containerClassName }>
			<span key="country-required-fields" className="checkout__form-info-text">
				{ countryName &&
					translate( 'The following fields are also required for payments in %(countryName)s', {
						args: {
							countryName,
						},
					} ) }
			</span>

			<OnlyAllowedField fieldName="document" allowedFieldNames={ fieldNames }>
				<CountrySpecificPaymentField
					fieldName="document"
					componentClass={ Input }
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					additionalProps={ {
						label: translate( 'Taxpayer Identification Number', {
							comment:
								'Individual taxpayer registry identification required ' +
								'for Brazilian payment methods on credit card form',
						} ),
					} }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="nik" allowedFieldNames={ fieldNames }>
				<CountrySpecificPaymentField
					fieldName="nik"
					componentClass={ Input }
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					additionalProps={ {
						label: translate( 'NIK - Indonesia Identity Card Number', {
							comment:
								'NIK - Indonesia Identity Card Number required for Indonesian payment methods.',
						} ),
					} }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="pan" allowedFieldNames={ fieldNames }>
				<CountrySpecificPaymentField
					fieldName="pan"
					componentClass={ Input }
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					additionalProps={ {
						placeholder: ' ',
						label: translate( 'PAN Number {{panNumberPopover/}}', {
							comment: 'India PAN number ',
							components: {
								panNumberPopover: getPanNumberPopover(),
							},
						} ),
					} }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="gstin" allowedFieldNames={ fieldNames }>
				<CountrySpecificPaymentField
					fieldName="gstin"
					componentClass={ Input }
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					additionalProps={ {
						placeholder: ' ',
						label: translate( 'GSTIN (optional)', {
							comment: 'India PAN number ',
						} ),
					} }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="phone-number" allowedFieldNames={ fieldNames }>
				<CountrySpecificPaymentField
					fieldName="phone-number"
					componentClass={ FormPhoneMediaInput }
					getFieldValue={ ( key: string ) => ( {
						value: getFieldValue( key ),
						countryCode: phoneCountryCode || countryCode,
					} ) }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ ( key, value ) => handlePhoneFieldChange( value ) }
					disabled={ disableFields }
					additionalProps={ {
						countriesList,
						label: translate( 'Phone' ),
					} }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="address-1" allowedFieldNames={ fieldNames }>
				<CountrySpecificPaymentField
					fieldName="address-1"
					componentClass={ Input }
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					additionalProps={ {
						maxLength: 40,
						label: translate( 'Address' ),
					} }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="street-number" allowedFieldNames={ fieldNames }>
				<CountrySpecificPaymentField
					fieldName="street-number"
					componentClass={ Input }
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					additionalProps={ {
						inputMode: 'numeric',
						label: translate( 'Street Number', {
							comment: 'Street number associated with address on credit card form',
						} ),
					} }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="address-2" allowedFieldNames={ fieldNames }>
				<CountrySpecificPaymentField
					fieldName="address-2"
					componentClass={ HiddenInput }
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					additionalProps={ {
						maxLength: 40,
						label: translate( 'Address Line 2' ),
						text: translate( '+ Add Address Line 2' ),
					} }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="city" allowedFieldNames={ fieldNames }>
				<CountrySpecificPaymentField
					fieldName="city"
					componentClass={ Input }
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					additionalProps={ {
						label: translate( 'City' ),
					} }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="state" allowedFieldNames={ fieldNames }>
				<div className="checkout__form-state-field">
					<CountrySpecificPaymentField
						fieldName="state"
						componentClass={ StateSelect }
						getFieldValue={ getFieldValue }
						getErrorMessages={ getErrorMessages }
						handleFieldChange={ handleFieldChange }
						disabled={ disableFields }
						additionalProps={ {
							countryCode,
							label: translate( 'State' ),
						} }
					/>
				</div>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="postal-code" allowedFieldNames={ fieldNames }>
				<CountrySpecificPaymentField
					fieldName="postal-code"
					componentClass={ Input }
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					additionalProps={ {
						label: translate( 'Postal Code' ),
					} }
				/>
			</OnlyAllowedField>
		</div>
	);
}
