import { smsCountryCodesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	CheckboxControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { type Field, type DataFormControlProps } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import InlineSupportLink from '../inline-support-link';
import PhoneNumberInput from '../phone-number-input';
import {
	createFieldAsyncValidator,
	type AsyncValidator,
	sanitizePhoneCountryCode,
	sanitizePhoneNumber,
	splitPhoneNumber,
	combinePhoneNumber,
	resolveSmsCountry,
} from './contact-validation-utils';
import { RegionAddressFieldsets } from './region-address-fieldsets';
import type { CountryListItem } from './custom-form-fieldsets/types';
import type { DomainContactDetails, StatesListItem } from '@automattic/api-core';

// The supported-countries list repeats popular countries and includes an empty-code
// separator; the combobox keys options by code, so dedupe to avoid duplicate React keys.
const getCountryElements = ( countryList: CountryListItem[] | undefined ) => {
	const seen = new Set< string >();
	const elements: { label: string; value: string }[] = [];
	for ( const country of countryList ?? [] ) {
		if ( ! country.code || seen.has( country.code ) ) {
			continue;
		}
		seen.add( country.code );
		elements.push( { label: country.name, value: country.code } );
	}
	return elements;
};

/**
 * Phone field control.
 *
 * The stored phone value encodes only the numeric dialing code (for example +1),
 * not which of the countries sharing that code the contact intends. On mount the
 * displayed country is seeded from the contact's address country (DOMENG-635) so
 * a shared code resolves to the right country on load. After that the phone
 * country is fully independent: it is held in local state, so neither later
 * address edits nor re-renders change it — only an explicit pick does.
 *
 * Keeping this as a stable, module-level component (rather than an inline Edit
 * closure) is what lets that state survive: an address change rebuilds the
 * fields array in getContactFormFields, and a fresh Edit function identity would
 * remount the control and wipe the state.
 */
function PhoneNumberField( {
	field,
	data,
	onChange,
}: DataFormControlProps< DomainContactDetails > ) {
	const { data: smsCountryCodes } = useSuspenseQuery( smsCountryCodesQuery() );
	const phoneValueRaw = field.getValue( { item: data } );
	const [ countryNumericCode, phoneNumber ] = splitPhoneNumber( phoneValueRaw );
	const phoneValue = combinePhoneNumber( countryNumericCode, phoneNumber );

	// Seed once from the address country; the initializer does not re-run on
	// later renders, so an address edit never moves the phone country.
	const [ selectedCountryCode, setSelectedCountryCode ] = useState(
		() =>
			resolveSmsCountry( smsCountryCodes, countryNumericCode, data.countryCode ?? '' )?.code ?? ''
	);

	// Handle both sync and async validators
	const [ validationMessage, setValidationMessage ] = useState< string | null >( null );

	useEffect( () => {
		const result = field.isValid?.custom?.( data, field );

		// Check if the result is a Promise (async validator)
		if ( result instanceof Promise ) {
			result.then( setValidationMessage );
		} else {
			// Sync validator - set the result directly
			setValidationMessage( result ?? null );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- re-validate only when phoneValue changes
	}, [ phoneValue ] );

	return (
		<PhoneNumberInput
			customValidity={
				validationMessage ? { type: 'invalid', message: validationMessage } : undefined
			}
			data={ {
				countryCode: selectedCountryCode,
				phoneNumber: phoneNumber,
				countryNumericCode: countryNumericCode,
			} }
			onChange={ ( edits ) => {
				// An explicit country pick updates the remembered country; typing the
				// number echoes the current country back unchanged, so it is a no-op.
				if ( edits.countryCode !== undefined && edits.countryCode !== selectedCountryCode ) {
					setSelectedCountryCode( edits.countryCode );
				}
				// Format the phone value back to the expected format: +country_code.phone_number
				const formattedPhone = combinePhoneNumber(
					sanitizePhoneCountryCode( edits.countryNumericCode ?? '' ),
					sanitizePhoneNumber( edits.phoneNumber ?? '' )
				);
				onChange( {
					phone: formattedPhone,
				} );
			} }
		/>
	);
}

export const getContactFormFields = (
	countryList: CountryListItem[] | undefined,
	statesList: StatesListItem[] | undefined,
	countryCode: string,
	asyncValidator: AsyncValidator
): Field< DomainContactDetails >[] => {
	return [
		{
			id: 'firstName',
			label: __( 'First name' ),
			type: 'text',
			isValid: {
				required: true,
				custom: createFieldAsyncValidator( 'firstName', asyncValidator ),
			},
		},
		{
			id: 'lastName',
			label: __( 'Last name' ),
			type: 'text',
			isValid: {
				required: true,
				custom: createFieldAsyncValidator( 'lastName', asyncValidator ),
			},
		},
		{
			id: 'organization',
			label: __( 'Organization' ),
			type: 'text',
			isValid: {
				custom: createFieldAsyncValidator( 'organization', asyncValidator ),
			},
		},
		{
			id: 'email',
			label: __( 'Email' ),
			type: 'email',
			isValid: {
				required: true,
				custom: createFieldAsyncValidator( 'email', asyncValidator ),
			},
		},
		{
			id: 'phone',
			label: __( 'Phone' ),
			type: 'text',
			Edit: PhoneNumberField,
			isValid: {
				required: true,
				custom: createFieldAsyncValidator( 'phone', asyncValidator ),
			},
		},
		{
			id: 'countryCode',
			label: __( 'Country' ),
			type: 'text',
			elements: getCountryElements( countryList ),
			isValid: {
				required: true,
				custom: createFieldAsyncValidator( 'countryCode', asyncValidator ),
			},
		},
		...RegionAddressFieldsets( statesList, countryCode, asyncValidator ),
		{
			id: 'optOutTransferLock',
			label: __( 'Opt-out of the 60-day transfer lock' ),
			type: 'boolean',
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, getValue } = field;
				return (
					<HStack spacing={ 0 } alignment="start" justify="flex-start">
						<CheckboxControl
							__nextHasNoMarginBottom
							label=""
							checked={ getValue( { item: data } ) }
							onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
						/>
						{ ! hideLabelFromVision && (
							<Text>
								{ createInterpolateElement(
									sprintf(
										/* translators: %s: "what is this?" link */
										__( 'Opt-out of the 60-day transfer lock. <link>%s</link>' ),
										__( 'What is this?' )
									),
									{
										link: <InlineSupportLink supportContext="60-day-transfer-lock" />,
									}
								) }
							</Text>
						) }
					</HStack>
				);
			},
		},
	];
};
