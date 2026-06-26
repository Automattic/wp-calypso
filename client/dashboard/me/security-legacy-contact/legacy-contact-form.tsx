import { addLegacyContactMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import type { Field } from '@wordpress/dataviews';

interface LegacyContactFormData {
	email: string;
}

const fields: Field< LegacyContactFormData >[] = [
	{
		id: 'email',
		label: __( 'Email address' ),
		type: 'email' as const,
		isValid: {
			required: true,
		},
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'email' ],
};

export default function LegacyContactForm() {
	const { recordTracksEvent } = useAnalytics();
	const { mutate: addContact, isPending } = useMutation( addLegacyContactMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< LegacyContactFormData >( { email: '' } );

	const { validity, isValid } = useFormValidity( formData, fields, form );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( ! isValid ) {
			return;
		}
		recordTracksEvent( 'calypso_dashboard_security_legacy_contact_add_click' );
		addContact( formData.email, {
			onSuccess: () => {
				createSuccessNotice( __( 'Legacy contact saved.' ), { type: 'snackbar' } );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to save legacy contact.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<DataForm< LegacyContactFormData >
					data={ formData }
					fields={ fields }
					form={ form }
					validity={ validity }
					onChange={ ( edits: Partial< LegacyContactFormData > ) =>
						setFormData( ( data ) => ( { ...data, ...edits } ) )
					}
				/>
				<ButtonStack justify="flex-start">
					<Button
						variant="primary"
						type="submit"
						isBusy={ isPending }
						disabled={ isPending || ! isValid }
					>
						{ __( 'Set up legacy contact' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}
