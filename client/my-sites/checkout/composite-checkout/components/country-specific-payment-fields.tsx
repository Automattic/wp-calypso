import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { createElement, useState } from 'react';
import FormPhoneMediaInput from 'calypso/components/forms/form-phone-media-input';
import InfoPopover from 'calypso/components/info-popover';
import { paymentMethodName } from 'calypso/lib/cart-values';
import { PAYMENT_PROCESSOR_COUNTRIES_FIELDS } from 'calypso/lib/checkout/constants';
import { StateSelect, Input, HiddenInput } from 'calypso/my-sites/domains/components/form';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { ComponentType } from 'react';

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

interface CreateFieldArgs< P > {
	fieldName: string;
	componentClass: ComponentType< P >;
	props: P;
	value: string;
	errorMessage: string;
	handleFieldChange: ( fieldName: string, newValue: string ) => void;
	disabled: boolean;
}

function createField< P >( {
	fieldName,
	componentClass,
	props,
	value,
	errorMessage,
	handleFieldChange,
	disabled,
}: CreateFieldArgs< P > ) {
	const onFieldChange = ( event: { target: { name: string; value: string } } ) =>
		handleFieldChange( event.target.name, event.target.value );
	const fieldProps = Object.assign(
		{},
		{
			additionalClasses: 'checkout__checkout-field',
			isError: errorMessage.length > 0,
			errorMessage,
			name: fieldName,
			onBlur: onFieldChange,
			onChange: onFieldChange,
			value,
			autoComplete: 'off',
			labelClass: 'checkout__form-label',
			disabled,
		},
		props
	);

	return createElement( componentClass, fieldProps );
}

interface CountrySpecificPaymentFieldProps< P > {
	fieldName: string;
	allowedFieldNames: string[];
	componentClass: ComponentType< P >;
	props: P;
	disabled?: boolean;
	getErrorMessages: ( fieldName: string ) => string[];
	getFieldValue: ( fieldName: string ) => string;
	handleFieldChange: ( fieldName: string, newValue: string ) => void;
}

function CountrySpecificPaymentField< P >( {
	fieldName,
	allowedFieldNames,
	componentClass,
	props,
	disabled,
	getErrorMessages,
	getFieldValue,
	handleFieldChange,
}: CountrySpecificPaymentFieldProps< P > ) {
	if ( ! allowedFieldNames.includes( fieldName ) ) {
		return null;
	}
	const errorMessages = getErrorMessages( fieldName );
	return createField( {
		fieldName,
		componentClass,
		props,
		value: getFieldValue( fieldName ),
		errorMessage: errorMessages.length > 0 ? errorMessages[ 0 ] : '',
		handleFieldChange,
		disabled: disabled ?? false,
	} );
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

			<CountrySpecificPaymentField
				fieldName="document"
				allowedFieldNames={ fieldNames }
				componentClass={ Input }
				getFieldValue={ getFieldValue }
				getErrorMessages={ getErrorMessages }
				handleFieldChange={ handleFieldChange }
				disabled={ disableFields }
				props={ {
					label: translate( 'Taxpayer Identification Number', {
						comment:
							'Individual taxpayer registry identification required ' +
							'for Brazilian payment methods on credit card form',
					} ),
				} }
			/>

			<CountrySpecificPaymentField
				fieldName="nik"
				allowedFieldNames={ fieldNames }
				componentClass={ Input }
				getFieldValue={ getFieldValue }
				getErrorMessages={ getErrorMessages }
				handleFieldChange={ handleFieldChange }
				disabled={ disableFields }
				props={ {
					label: translate( 'NIK - Indonesia Identity Card Number', {
						comment:
							'NIK - Indonesia Identity Card Number required for Indonesian payment methods.',
					} ),
				} }
			/>

			<CountrySpecificPaymentField
				fieldName="pan"
				allowedFieldNames={ fieldNames }
				componentClass={ Input }
				getFieldValue={ getFieldValue }
				getErrorMessages={ getErrorMessages }
				handleFieldChange={ handleFieldChange }
				disabled={ disableFields }
				props={ {
					placeholder: ' ',
					label: translate( 'PAN Number {{panNumberPopover/}}', {
						comment: 'India PAN number ',
						components: {
							panNumberPopover: getPanNumberPopover(),
						},
					} ),
				} }
			/>

			<CountrySpecificPaymentField
				fieldName="gstin"
				allowedFieldNames={ fieldNames }
				componentClass={ Input }
				getFieldValue={ getFieldValue }
				getErrorMessages={ getErrorMessages }
				handleFieldChange={ handleFieldChange }
				disabled={ disableFields }
				props={ {
					placeholder: ' ',
					label: translate( 'GSTIN (optional)', {
						comment: 'India PAN number ',
					} ),
				} }
			/>

			<CountrySpecificPaymentField
				fieldName="phone-number"
				allowedFieldNames={ fieldNames }
				componentClass={ FormPhoneMediaInput }
				getFieldValue={ getFieldValue }
				getErrorMessages={ getErrorMessages }
				handleFieldChange={ handleFieldChange }
				disabled={ disableFields }
				props={ {
					// This is the same as what would be automatically provided by
					// CountrySpecificPaymentField but is required here by TypeScript to
					// validate the component props.
					value: getFieldValue( 'phone-number' ),
					// This will override the handleFieldChange prop.
					onChange: handlePhoneFieldChange,
					countriesList,
					// If the user has manually selected a country for the phone
					// number, use that, but otherwise default this to the same
					// country as the billing address.
					countryCode: phoneCountryCode || countryCode,
					label: translate( 'Phone' ),
				} }
			/>

			<CountrySpecificPaymentField
				fieldName="address-1"
				allowedFieldNames={ fieldNames }
				componentClass={ Input }
				getFieldValue={ getFieldValue }
				getErrorMessages={ getErrorMessages }
				handleFieldChange={ handleFieldChange }
				disabled={ disableFields }
				props={ {
					maxLength: 40,
					label: translate( 'Address' ),
				} }
			/>

			<CountrySpecificPaymentField
				fieldName="street-number"
				allowedFieldNames={ fieldNames }
				componentClass={ Input }
				getFieldValue={ getFieldValue }
				getErrorMessages={ getErrorMessages }
				handleFieldChange={ handleFieldChange }
				disabled={ disableFields }
				props={ {
					inputMode: 'numeric',
					label: translate( 'Street Number', {
						comment: 'Street number associated with address on credit card form',
					} ),
				} }
			/>

			<CountrySpecificPaymentField
				fieldName="address-2"
				allowedFieldNames={ fieldNames }
				componentClass={ HiddenInput }
				getFieldValue={ getFieldValue }
				getErrorMessages={ getErrorMessages }
				handleFieldChange={ handleFieldChange }
				disabled={ disableFields }
				props={ {
					maxLength: 40,
					label: translate( 'Address Line 2' ),
					text: translate( '+ Add Address Line 2' ),
				} }
			/>

			<CountrySpecificPaymentField
				fieldName="city"
				allowedFieldNames={ fieldNames }
				componentClass={ Input }
				getFieldValue={ getFieldValue }
				getErrorMessages={ getErrorMessages }
				handleFieldChange={ handleFieldChange }
				disabled={ disableFields }
				props={ {
					label: translate( 'City' ),
				} }
			/>

			<div className="checkout__form-state-field">
				<CountrySpecificPaymentField
					fieldName="state"
					allowedFieldNames={ fieldNames }
					componentClass={ StateSelect }
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					props={ {
						countryCode,
						label: translate( 'State' ),
					} }
				/>
			</div>

			<CountrySpecificPaymentField
				fieldName="postal-code"
				allowedFieldNames={ fieldNames }
				componentClass={ Input }
				getFieldValue={ getFieldValue }
				getErrorMessages={ getErrorMessages }
				handleFieldChange={ handleFieldChange }
				disabled={ disableFields }
				props={ {
					label: translate( 'Postal Code' ),
				} }
			/>
		</div>
	);
}
