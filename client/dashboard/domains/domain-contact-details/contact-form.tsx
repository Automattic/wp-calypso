import { type Domain, type DomainContactDetails } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';

interface ContactFormProps {
	domain: Domain;
	initialData: DomainContactDetails;
	onSave: ( data: DomainContactDetails, transferLock: boolean ) => void;
	onCancel: () => void;
	isSubmitting: boolean;
	isEditing: boolean;
}

export default function ContactForm( {
	domain,
	initialData,
	onSave,
	onCancel,
	isSubmitting,
	isEditing,
}: ContactFormProps ) {
	// This component will be implemented in task 5
	return (
		<div>
			<p>{ __( 'Contact form will be implemented in task 5' ) }</p>
			<p>
				{ __( 'Domain:' ) } { domain.domain }
			</p>
			<p>
				{ __( 'Editing mode:' ) } { isEditing ? __( 'Yes' ) : __( 'No' ) }
			</p>
			{ /* Placeholder to use props to avoid unused variable warnings */ }
			<div style={ { display: 'none' } }>
				{ JSON.stringify( { initialData, onSave, onCancel, isSubmitting } ) }
			</div>
		</div>
	);
}
