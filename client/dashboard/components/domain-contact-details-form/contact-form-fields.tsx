import { smsCountryCodesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	CheckboxControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { type Field } from '@wordpress/dataviews';
import { createInterpolateElement, useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { validatePhone } from '../../utils/phone-number';
import InlineSupportLink from '../inline-support-link';
import PhoneNumberInput from '../phone-number-input';
import { RegionAddressFieldsets } from './region-address-fieldsets';
import type { CountryListItem } from './custom-form-fieldsets/types';
import type { DomainContactDetails, StatesListItem } from '@automattic/api-core';

export const getContactFormFields = (
	countryList: CountryListItem[] | undefined,
	statesList: StatesListItem[] | undefined,
	countryCode: string
): Field< DomainContactDetails >[] => {
	return [
		{
			id: 'firstName',
			label: __( 'First name' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'lastName',
			label: __( 'Last name' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'organization',
			label: __( 'Organization' ),
			type: 'text',
		},
		{
			id: 'email',
			label: __( 'Email' ),
			type: 'email',
			isValid: {
				required: true,
			},
		},
		{
			id: 'phone',
			label: __( 'Phone' ),
			type: 'text',
			Edit: ( { field, data, onChange } ) => {
				const { getValue } = field;
				const { data: smsCountryCodes } = useSuspenseQuery( smsCountryCodesQuery() );
				const phoneValue = getValue( { item: data } );

				// Our backend stores phone number in the format: +country_code.phone_number
				const [ countryNumericCode, phoneNumber ] = phoneValue?.split( '.' ) ?? [ '', '' ];

				// Find country code from the numeric code using SMS country codes
				const smsCountry = smsCountryCodes?.find(
					( country ) => country.numeric_code === countryNumericCode
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
				}, [ data, field ] );

				return (
					<PhoneNumberInput
						customValidity={
							validationMessage ? { type: 'invalid', message: validationMessage } : undefined
						}
						data={ {
							countryCode: smsCountry?.code || '',
							phoneNumber: phoneNumber,
							countryNumericCode: countryNumericCode,
						} }
						onChange={ ( edits ) => {
							// Format the phone value back to the expected format: +country_code.phone_number
							const formattedPhone = edits.countryNumericCode
								? `${ edits.countryNumericCode }.${ edits.phoneNumber || '' }`
								: '';

							onChange( {
								phone: formattedPhone,
							} );
						} }
					/>
				);
			},
			isValid: {
				required: true,
				custom: ( item, field ) => {
					const raw = field.getValue ? field.getValue( { item } ) : '';
					if ( ! raw ) {
						return null;
					}
					const fullPhoneNumber = String( raw ).split( '.' ).join( '' );
					const [ , phoneNumberOnly ] = String( raw ).split( '.' ) ?? [ '', '' ];
					const result = validatePhone( fullPhoneNumber );

					if ( 'error' in result && result.error === 'phone_number_too_short' ) {
						const resultWithoutCountryCode = validatePhone( phoneNumberOnly );
						return 'error' in resultWithoutCountryCode ? resultWithoutCountryCode.message : null;
					}

					return 'error' in result ? result.message : null;
				},
			},
		},
		{
			id: 'countryCode',
			label: __( 'Country' ),
			type: 'text',
			elements:
				countryList?.map( ( country ) => ( {
					label: country.name,
					value: country.code,
				} ) ) ?? [],
			isValid: {
				required: true,
			},
		},
		...RegionAddressFieldsets( statesList, countryCode ),
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
