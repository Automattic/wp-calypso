import { agencyTeamInviteMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button, Modal, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import type { Field, Form } from '@wordpress/dataviews';

interface InviteTeamMemberModalProps {
	agencyId: number;
	onClose: () => void;
	onSent: ( login: string ) => void;
}

interface InviteFormData {
	login: string;
	message: string;
}

const fields: Field< InviteFormData >[] = [
	{
		id: 'login',
		type: 'text',
		label: __( 'Email or WordPress.com username' ),
		placeholder: __( 'team-member@example.com' ),
		isValid: {
			custom: ( item ) =>
				item.login.trim() === ''
					? __( 'Please enter a valid email or WordPress.com username.' )
					: null,
		},
	},
	{
		id: 'message',
		type: 'text',
		Edit: 'textarea',
		label: __( 'Message' ),
		description: __(
			'Optional: Include a custom message to provide more context to your team member.'
		),
	},
];

const form: Form = {
	layout: { type: 'regular' },
	fields: [ 'login', 'message' ],
};

export default function InviteTeamMemberModal( {
	agencyId,
	onClose,
	onSent,
}: InviteTeamMemberModalProps ) {
	const { recordTracksEvent } = useAnalytics();
	const [ formData, setFormData ] = useState< InviteFormData >( { login: '', message: '' } );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const invite = useMutation( agencyTeamInviteMutation( agencyId ) );
	const { validity, isValid } = useFormValidity( formData, fields, form );

	const onSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( invite.isPending ) {
			return;
		}
		if ( ! isValid ) {
			recordTracksEvent( 'calypso_a4a_team_invite_error', { error: 'empty_username' } );
			return;
		}
		const trimmedLogin = formData.login.trim();
		const message = formData.message.trim();
		recordTracksEvent( 'calypso_a4a_team_invite_submit', { has_message: !! message } );
		invite.mutate(
			{ login: trimmedLogin, message },
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_a4a_team_invite_success' );
					createSuccessNotice( __( 'The invitation has been successfully sent.' ), {
						type: 'snackbar',
					} );
					onSent( trimmedLogin );
				},
				onError: ( error: Error & { code?: string } ) => {
					recordTracksEvent( 'calypso_a4a_team_invite_error', {
						error: error.code || 'api_error',
					} );
					createErrorNotice(
						error.code === 'a4a_user_invite_automattician'
							? __( 'Automattician accounts cannot be invited as agency team members.' )
							: error.message || __( 'Failed to send the invitation.' ),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	return (
		<Modal title={ __( 'Invite a team member' ) } onRequestClose={ onClose } size="medium">
			<form onSubmit={ onSubmit }>
				<VStack spacing={ 4 }>
					<DataForm< InviteFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						validity={ validity }
						onChange={ ( edits: Partial< InviteFormData > ) =>
							setFormData( ( data ) => ( { ...data, ...edits } ) )
						}
					/>
					<ButtonStack justify="flex-end">
						<Button variant="tertiary" __next40pxDefaultSize onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							__next40pxDefaultSize
							isBusy={ invite.isPending }
							disabled={ invite.isPending }
						>
							{ __( 'Send invite' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
