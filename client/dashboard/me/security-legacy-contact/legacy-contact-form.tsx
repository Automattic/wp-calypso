import { addLegacyContactMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalInputControl as InputControl,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import type { Field } from '@wordpress/dataviews';

interface LegacyContactFormData {
	email: string;
}

export default function LegacyContactForm() {
	const { recordTracksEvent } = useAnalytics();
	const { mutate: addContact, isPending } = useMutation( addLegacyContactMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< LegacyContactFormData >( { email: '' } );

	const fields: Field< LegacyContactFormData >[] = useMemo(
		() => [
			{
				id: 'email',
				label: __( 'Email address' ),
				type: 'email',
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<InputControl
							__next40pxDefaultSize
							type="email"
							label={ field.label }
							value={ getValue( { item: data } ) }
							onChange={ ( value ) => onChange( { [ id ]: value ?? '' } ) }
							disabled={ isPending }
						/>
					);
				},
			},
		],
		[ isPending ]
	);

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
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
					form={ {
						layout: { type: 'regular' as const },
						fields: fields.map( ( field ) => field.id ),
					} }
					onChange={ ( edits: Partial< LegacyContactFormData > ) =>
						setFormData( ( data ) => ( { ...data, ...edits } ) )
					}
				/>
				<ButtonStack justify="flex-start">
					<Button
						variant="primary"
						type="submit"
						isBusy={ isPending }
						disabled={ isPending || ! formData.email }
					>
						{ __( 'Set up legacy contact' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}
