import { normalizeAgencyBookingLink } from '@automattic/api-core';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useId } from 'react';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import { useSelector } from 'calypso/state';
import getCountries from 'calypso/state/selectors/get-countries';
import type { LeadMatchingDetails } from '../types';
import type { KeyboardEvent } from 'react';

function preventFormSubmit( event: KeyboardEvent< HTMLInputElement | HTMLSelectElement > ) {
	if ( event.key === 'Enter' ) {
		event.preventDefault();
	}
}

export default function ContactOptionsPreview( {
	countryCode,
	formData,
	onChange,
	errors,
}: {
	countryCode?: string;
	formData: LeadMatchingDetails;
	onChange: ( fields: Partial< LeadMatchingDetails > ) => void;
	errors: { phone?: string; bookingLink?: string };
} ) {
	const id = useId();
	const countriesList = useSelector( ( state ) => getCountries( state, 'sms' ) ) ?? [];

	return (
		<FormSection
			title={ __( 'Contact options' ) }
			description={ __(
				'We add these to the email that introduces you to a matched client, so they can call you or book a time right away.'
			) }
			className="partner-directory-lead-matching__form-section"
		>
			{ countriesList.length === 0 && <QuerySmsCountries /> }
			<FormPhoneInput
				className="partner-directory-lead-matching__phone-input"
				countriesList={ countriesList }
				initialCountryCode={ countryCode }
				value={ {
					countryCode: formData.phoneCountryCode || countryCode || countriesList[ 0 ]?.code || '',
					phoneNumber: formData.phoneNumber,
				} }
				onChangeRaw={ ( value: { countryCode: string; phoneNumber: string } ) =>
					onChange( { phoneCountryCode: value.countryCode, phoneNumber: value.phoneNumber } )
				}
				isDisabled={ countriesList.length === 0 }
				phoneNumberLabel={ __( 'Phone number (optional)' ) }
				countrySelectProps={ {
					id: 'country_code',
				} }
				phoneInputProps={ {
					id: 'phone_number',
					placeholder: __( 'e.g. 123456789' ),
					autoComplete: 'off',
					pattern: undefined,
					'aria-invalid': !! errors.phone,
					'aria-describedby': errors.phone ? `${ id }-phone-error` : undefined,
					onKeyDown: preventFormSubmit,
				} }
			/>
			{ errors.phone && (
				<p id={ `${ id }-phone-error` } role="alert">
					{ errors.phone }
				</p>
			) }
			<FormField
				label={ __( 'Booking link' ) }
				labelFor={ `${ id }-booking-link` }
				showOptionalLabel
				error={ errors.bookingLink }
				description={ __( 'Where clients can book a call with you.' ) }
			>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					id={ `${ id }-booking-link` }
					inputMode="url"
					autoComplete="off"
					value={ formData.bookingLink }
					onChange={ ( bookingLink ) => onChange( { bookingLink } ) }
					onBlur={ () =>
						onChange( { bookingLink: normalizeAgencyBookingLink( formData.bookingLink ) } )
					}
					aria-invalid={ !! errors.bookingLink }
					onKeyDown={ preventFormSubmit }
				/>
			</FormField>
		</FormSection>
	);
}
