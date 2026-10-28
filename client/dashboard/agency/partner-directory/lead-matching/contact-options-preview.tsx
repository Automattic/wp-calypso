import {
	Notice,
	Spinner,
	TextControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Suspense, useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { ErrorBoundary } from '../../../components/error-boundary';
import PhoneNumberInput, { type SecuritySMSNumber } from '../../../components/phone-number-input';
import { SectionHeader } from '../../../components/section-header';

export default function ContactOptionsPreview( { countryCode = '' }: { countryCode?: string } ) {
	const [ phone, setPhone ] = useState< SecuritySMSNumber >( {
		countryCode,
		countryNumericCode: '',
		phoneNumber: '',
	} );
	const [ bookingLink, setBookingLink ] = useState( '' );

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Contact options' ) }
						description={ __(
							'We add these to the email that introduces you to a matched client, so they can call you or book a time right away.'
						) }
					/>
					<ErrorBoundary
						fallback={
							<Notice status="warning" isDismissible={ false }>
								{ __(
									'The phone number field is temporarily unavailable. You can still save your preferences.'
								) }
							</Notice>
						}
						sentryTags={ { feature: 'agency-lead-matching-contact-options' } }
					>
						<Suspense fallback={ <Spinner /> }>
							<PhoneNumberInput
								label={ __( 'Phone number (optional)' ) }
								data={ phone }
								onChange={ ( value ) => setPhone( ( state ) => ( { ...state, ...value } ) ) }
							/>
						</Suspense>
					</ErrorBoundary>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Booking link (optional)' ) }
						help={ __( 'Where clients can book a call with you.' ) }
						inputMode="url"
						autoComplete="off"
						value={ bookingLink }
						onChange={ setBookingLink }
					/>
				</VStack>
			</CardBody>
		</Card>
	);
}
