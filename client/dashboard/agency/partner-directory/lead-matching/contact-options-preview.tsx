import { normalizeAgencyBookingLink } from '@automattic/api-core';
import {
	Notice,
	Spinner,
	TextControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Suspense } from 'react';
import { Card, CardBody } from '../../../components/card';
import { ErrorBoundary } from '../../../components/error-boundary';
import PhoneNumberInput from '../../../components/phone-number-input';
import { SectionHeader } from '../../../components/section-header';
import type { LeadMatchingFormData } from './form-data';

export default function ContactOptionsPreview( {
	countryCode = '',
	formData,
	onChange,
	errors,
}: {
	countryCode?: string;
	formData: LeadMatchingFormData;
	onChange: ( fields: Partial< LeadMatchingFormData > ) => void;
	errors: { phone?: string; bookingLink?: string };
} ) {
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
								placeholder={ __( 'e.g. 123456789' ) }
								data={ {
									phoneNumber: formData.phoneNumber,
									countryCode: formData.phoneCountryCode || countryCode,
									countryNumericCode: '',
								} }
								onChange={ ( value ) =>
									onChange( {
										phoneNumber: value.phoneNumber,
										phoneCountryCode: value.countryCode,
									} )
								}
								customValidity={
									errors.phone ? { type: 'invalid', message: errors.phone } : undefined
								}
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
						value={ formData.bookingLink }
						onChange={ ( bookingLink ) => onChange( { bookingLink } ) }
						onBlur={ () =>
							onChange( { bookingLink: normalizeAgencyBookingLink( formData.bookingLink ) } )
						}
						aria-invalid={ !! errors.bookingLink }
					/>
					{ errors.bookingLink && (
						<Notice status="error" isDismissible={ false }>
							{ errors.bookingLink }
						</Notice>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
