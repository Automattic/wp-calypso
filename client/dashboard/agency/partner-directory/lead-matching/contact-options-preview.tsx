import { Notice, TextControl, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';

export default function ContactOptionsPreview() {
	const [ phone, setPhone ] = useState( '' );
	const [ bookingLink, setBookingLink ] = useState( '' );

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Contact options' ) }
						description={ __( 'Matched clients can use these details to contact your agency.' ) }
					/>
					<Notice status="info" isDismissible={ false }>
						{ __(
							'Design preview: These contact details are not saved. Other profile fields save as usual.'
						) }
					</Notice>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Agency phone number (optional)' ) }
						inputMode="tel"
						autoComplete="off"
						value={ phone }
						onChange={ setPhone }
					/>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Booking link (optional)' ) }
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
