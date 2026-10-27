import { Notice, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useId, useState } from 'react';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import type { KeyboardEvent } from 'react';

function preventFormSubmit( event: KeyboardEvent< HTMLInputElement > ) {
	if ( event.key === 'Enter' ) {
		event.preventDefault();
	}
}

export default function ContactOptionsPreview() {
	const id = useId();
	const [ phone, setPhone ] = useState( '' );
	const [ bookingLink, setBookingLink ] = useState( '' );

	return (
		<FormSection
			title={ __( 'Contact options' ) }
			description={ __( 'Matched clients can use these details to contact your agency.' ) }
			className="partner-directory-lead-matching__form-section"
		>
			<Notice status="info" isDismissible={ false }>
				{ __(
					'Design preview: These contact details are not saved. Other profile fields save as usual.'
				) }
			</Notice>
			<FormField
				label={ __( 'Agency phone number' ) }
				labelFor={ `${ id }-phone` }
				showOptionalLabel
			>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					id={ `${ id }-phone` }
					inputMode="tel"
					autoComplete="off"
					value={ phone }
					onChange={ setPhone }
					onKeyDown={ preventFormSubmit }
				/>
			</FormField>
			<FormField
				label={ __( 'Booking link' ) }
				labelFor={ `${ id }-booking-link` }
				showOptionalLabel
			>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					id={ `${ id }-booking-link` }
					inputMode="url"
					autoComplete="off"
					value={ bookingLink }
					onChange={ setBookingLink }
					onKeyDown={ preventFormSubmit }
				/>
			</FormField>
		</FormSection>
	);
}
