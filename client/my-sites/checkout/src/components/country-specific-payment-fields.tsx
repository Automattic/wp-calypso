import styled from '@emotion/styled';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormPhoneMediaInput from 'calypso/components/forms/form-phone-media-input';
import InfoPopover from 'calypso/components/info-popover';
import { paymentMethodName } from 'calypso/lib/cart-values';
import { PAYMENT_PROCESSOR_COUNTRIES_FIELDS } from 'calypso/lib/checkout/constants';
import { StateSelect, Input, HiddenInput } from 'calypso/my-sites/domains/components/form';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { PhoneInputValue } from 'calypso/components/phone-input';
import type { PropsWithChildren, ReactNode } from 'react';

export type CountrySpecificPaymentFieldsProps = {
	className?: string;
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

function getGenericFieldProps< Value, ChangeValue >( {
	fieldName,
	getErrorMessages,
	getFieldValue,
	onChange,
}: {
	fieldName: string;
	getErrorMessages: ( fieldName: string ) => string[];
	getFieldValue: ( fieldName: string ) => Value;
	onChange: ( eventOrValue: ChangeValue ) => void;
} ) {
	const errorMessages = getErrorMessages( fieldName );
	const errorMessage = errorMessages.length > 0 ? errorMessages[ 0 ] : '';
	const value = getFieldValue( fieldName );
	return {
		additionalClasses: 'checkout__checkout-field',
		isError: errorMessage.length > 0,
		autoComplete: 'off',
		labelClass: 'checkout__form-label',
		name: fieldName,
		onBlur: onChange,
		errorMessage,
		onChange,
		value,
	};
}

function InputField( {
	fieldName,
	handleFieldChange,
	getErrorMessages,
	getFieldValue,
	disabled,
	label,
	placeholder,
	maxLength,
	inputMode,
}: {
	fieldName: string;
	handleFieldChange: ( fieldName: string, newValue: string ) => void;
	getErrorMessages: ( fieldName: string ) => string[];
	getFieldValue: ( fieldName: string ) => string;
	disabled?: boolean;
	label: ReactNode;
	placeholder?: string;
	maxLength?: number;
	inputMode?: string;
} ) {
	const onChange = ( event: { target: { value: string } } ) =>
		handleFieldChange( fieldName, event.target.value );
	const genericProps = getGenericFieldProps( {
		fieldName,
		getErrorMessages,
		getFieldValue,
		onChange,
	} );
	const fieldProps = {
		...genericProps,
		label,
		disabled,
		placeholder,
		maxLength,
		inputMode,
	};

	return <Input { ...fieldProps } />;
}

function HiddenInputField( {
	fieldName,
	handleFieldChange,
	getErrorMessages,
	getFieldValue,
	disabled,
	maxLength,
	label,
	text,
}: {
	fieldName: string;
	handleFieldChange: ( fieldName: string, newValue: string ) => void;
	getErrorMessages: ( fieldName: string ) => string[];
	getFieldValue: ( fieldName: string ) => string;
	disabled?: boolean;
	maxLength: number;
	label: string;
	text: string;
} ) {
	const onChange = ( event: { target: { value: string } } ) =>
		handleFieldChange( fieldName, event.target.value );
	const genericProps = getGenericFieldProps( {
		fieldName,
		getErrorMessages,
		getFieldValue,
		onChange,
	} );
	const fieldProps = {
		...genericProps,
		disabled,
		label,
		maxLength,
		text,
	};

	return <HiddenInput { ...fieldProps } />;
}

function StateSelectField( {
	fieldName,
	handleFieldChange,
	getErrorMessages,
	getFieldValue,
	disabled,
	countryCode,
	label,
}: {
	fieldName: string;
	handleFieldChange: ( fieldName: string, newValue: string ) => void;
	getErrorMessages: ( fieldName: string ) => string[];
	getFieldValue: ( fieldName: string ) => string;
	disabled?: boolean;
	countryCode: string;
	label: string;
} ) {
	const onChange = ( event: { target: { value: string } } ) =>
		handleFieldChange( fieldName, event.target.value );
	const genericProps = getGenericFieldProps( {
		fieldName,
		getErrorMessages,
		getFieldValue,
		onChange,
	} );
	const fieldProps = {
		...genericProps,
		countryCode,
		disabled,
		label,
	};

	return <StateSelect { ...fieldProps } />;
}

function PhoneInputField( {
	fieldName,
	handleFieldChange,
	getErrorMessages,
	getFieldValue,
	disabled,
	label,
	countriesList,
}: {
	fieldName: string;
	handleFieldChange: ( fieldName: string, newValue: PhoneInputValue ) => void;
	getErrorMessages: ( fieldName: string ) => string[];
	getFieldValue: ( fieldName: string ) => PhoneInputValue;
	disabled?: boolean;
	label: string;
	countriesList: CountryListItem[];
} ) {
	const onChange = ( newValue: PhoneInputValue ) => handleFieldChange( fieldName, newValue );
	const genericProps = getGenericFieldProps( {
		fieldName,
		getErrorMessages,
		getFieldValue,
		onChange,
	} );
	const fieldProps = {
		...genericProps,
		disabled,
		label,
		countriesList,
	};

	return <FormPhoneMediaInput { ...fieldProps } />;
}

export function CountrySpecificPaymentFieldsUnstyled( {
	className,
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
		phoneNumber: newPhoneNumber,
		countryCode: newPhoneCountryCode,
	}: PhoneInputValue ) => {
		handleFieldChange( 'phone-number', newPhoneNumber );
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
	const containerClassName = clsx(
		'checkout__country-payment-fields',
		`checkout__country-${ countryCode.toLowerCase() }`,
		className
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
				<InputField
					fieldName="document"
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					label={ translate( 'Taxpayer Identification Number', {
						comment:
							'Individual taxpayer registry identification required ' +
							'for Brazilian payment methods on credit card form',
					} ) }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="nik" allowedFieldNames={ fieldNames }>
				<InputField
					fieldName="nik"
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					label={ translate( 'NIK - Indonesia Identity Card Number', {
						comment:
							'NIK - Indonesia Identity Card Number required for Indonesian payment methods.',
					} ) }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="pan" allowedFieldNames={ fieldNames }>
				<InputField
					fieldName="pan"
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					placeholder={ ' ' }
					label={ translate( 'PAN Number {{panNumberPopover/}}', {
						comment: 'India PAN number ',
						components: {
							panNumberPopover: getPanNumberPopover(),
						},
					} ) }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="gstin" allowedFieldNames={ fieldNames }>
				<InputField
					fieldName="gstin"
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					placeholder={ ' ' }
					label={ translate( 'GSTIN (optional)', {
						comment: 'India PAN number ',
					} ) }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="phone-number" allowedFieldNames={ fieldNames }>
				<PhoneInputField
					fieldName="phone-number"
					getFieldValue={ ( key: string ) => ( {
						phoneNumber: getFieldValue( key ),
						countryCode: phoneCountryCode || countryCode,
					} ) }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ ( key, value ) => handlePhoneFieldChange( value ) }
					disabled={ disableFields }
					countriesList={ countriesList }
					label={ translate( 'Phone' ) }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="address-1" allowedFieldNames={ fieldNames }>
				<InputField
					fieldName="address-1"
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					maxLength={ 40 }
					label={ translate( 'Address' ) }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="street-number" allowedFieldNames={ fieldNames }>
				<InputField
					fieldName="street-number"
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					inputMode="numeric"
					label={ translate( 'Street Number', {
						comment: 'Street number associated with address on credit card form',
					} ) }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="address-2" allowedFieldNames={ fieldNames }>
				<HiddenInputField
					fieldName="address-2"
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					maxLength={ 40 }
					label={ translate( 'Address Line 2' ) }
					text={ translate( '+ Add Address Line 2' ) }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="city" allowedFieldNames={ fieldNames }>
				<InputField
					fieldName="city"
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					label={ translate( 'City' ) }
				/>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="state" allowedFieldNames={ fieldNames }>
				<div className="checkout__form-state-field">
					<StateSelectField
						fieldName="state"
						getFieldValue={ getFieldValue }
						getErrorMessages={ getErrorMessages }
						handleFieldChange={ handleFieldChange }
						disabled={ disableFields }
						countryCode={ countryCode }
						label={ translate( 'State' ) }
					/>
				</div>
			</OnlyAllowedField>

			<OnlyAllowedField fieldName="postal-code" allowedFieldNames={ fieldNames }>
				<InputField
					fieldName="postal-code"
					getFieldValue={ getFieldValue }
					getErrorMessages={ getErrorMessages }
					handleFieldChange={ handleFieldChange }
					disabled={ disableFields }
					label={ translate( 'Postal Code' ) }
				/>
			</OnlyAllowedField>
		</div>
	);
}
