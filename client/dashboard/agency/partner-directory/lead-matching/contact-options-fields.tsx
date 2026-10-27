import { TextControl, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import PhoneNumberInput, { type SecuritySMSNumber } from '../../../components/phone-number-input';

/**
 * The agency's phone number and booking link, added to the email that
 * introduces a matched client. Not saved yet: a design preview.
 */
export default function ContactOptionsFields( { countryCode = '' }: { countryCode?: string } ) {
	const [ phone, setPhone ] = useState< SecuritySMSNumber >( {
		countryCode,
		countryNumericCode: '',
		phoneNumber: '',
	} );
	const [ bookingLink, setBookingLink ] = useState( '' );

	return (
		<VStack spacing={ 4 }>
			<PhoneNumberInput
				label={ __( 'Phone number (optional)' ) }
				data={ phone }
				onChange={ ( value ) => setPhone( ( state ) => ( { ...state, ...value } ) ) }
			/>
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				type="url"
				label={ __( 'Booking link (optional)' ) }
				help={ __( 'Where clients can book a call with you.' ) }
				autoComplete="off"
				value={ bookingLink }
				onChange={ setBookingLink }
			/>
		</VStack>
	);
}
