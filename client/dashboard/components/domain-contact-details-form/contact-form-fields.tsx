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
import InlineSupportLink from '../inline-support-link';
import PhoneNumberInput from '../phone-number-input';
import { createFieldAsyncValidator, type AsyncValidator } from './contact-validation-utils';
import {
	sanitizePhoneCountryCode,
	sanitizePhoneNumber,
	splitPhoneNumber,
	combinePhoneNumber,
} from './contact-validation-utils';
import { RegionAddressFieldsets } from './region-address-fieldsets';
import type { CountryListItem } from './custom-form-fieldsets/types';
import type { DomainContactDetails, StatesListItem } from '@automattic/api-core';

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
			Edit: ( { field, data, onChange } ) => {
				const { getValue } = field;
				const { data: smsCountryCodes } = useSuspenseQuery( smsCountryCodesQuery() );
				const phoneValueRaw = getValue( { item: data } );

				const [ countryNumericCode, phoneNumber ] = splitPhoneNumber( phoneValueRaw );

				const phoneValue = combinePhoneNumber( countryNumericCode, phoneNumber );

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
				}, [ phoneValue ] );

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
			},
			isValid: {
				required: true,
				custom: createFieldAsyncValidator( 'phone', asyncValidator ),
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
