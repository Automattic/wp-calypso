import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { prependHTTPS } from '@wordpress/url';
import { useId, useState } from 'react';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import { useSelector } from 'calypso/state';
import getCountries from 'calypso/state/selectors/get-countries';
import type { KeyboardEvent } from 'react';

function preventFormSubmit( event: KeyboardEvent< HTMLInputElement | HTMLSelectElement > ) {
	if ( event.key === 'Enter' ) {
		event.preventDefault();
	}
}

export default function ContactOptionsPreview( { countryCode }: { countryCode?: string } ) {
	const id = useId();
	const countriesList = useSelector( ( state ) => getCountries( state, 'sms' ) ) ?? [];
	const [ bookingLink, setBookingLink ] = useState( '' );

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
				isDisabled={ countriesList.length === 0 }
				phoneNumberLabel={ __( 'Phone number (optional)' ) }
				countrySelectProps={ {
					id: 'country_code',
					onKeyDown: preventFormSubmit,
				} }
				phoneInputProps={ {
					id: 'phone_number',
					placeholder: __( 'e.g. 123456789' ),
					autoComplete: 'off',
					pattern: undefined,
					onKeyDown: preventFormSubmit,
				} }
			/>
			<FormField
				label={ __( 'Booking link' ) }
				labelFor={ `${ id }-booking-link` }
				showOptionalLabel
				description={ __( 'Where clients can book a call with you.' ) }
			>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					id={ `${ id }-booking-link` }
					inputMode="url"
					autoComplete="off"
					value={ bookingLink }
					onChange={ setBookingLink }
					onBlur={ () => setBookingLink( prependHTTPS( bookingLink.trim() ) ) }
					onKeyDown={ preventFormSubmit }
				/>
			</FormField>
		</FormSection>
	);
}
