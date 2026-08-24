import { agencyTeamInviteMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	Modal,
	TextControl,
	TextareaControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';

interface InviteTeamMemberModalProps {
	agencyId: number;
	onClose: () => void;
}

export default function InviteTeamMemberModal( { agencyId, onClose }: InviteTeamMemberModalProps ) {
	const [ login, setLogin ] = useState( '' );
	const [ message, setMessage ] = useState( '' );
	const [ error, setError ] = useState( '' );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const invite = useMutation( agencyTeamInviteMutation( agencyId ) );

	const onSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( ! login.trim() ) {
			setError( __( 'Please enter a valid email or WordPress.com username.' ) );
			return;
		}
		invite.mutate(
			{ login: login.trim(), message: message.trim() },
			{
				onSuccess: () => {
					createSuccessNotice( __( 'The invitation has been successfully sent.' ), {
						type: 'snackbar',
					} );
					onClose();
				},
				onError: () =>
					createErrorNotice( __( 'Failed to send the invitation.' ), { type: 'snackbar' } ),
			}
		);
	};

	return (
		<Modal title={ __( 'Invite a team member' ) } onRequestClose={ onClose } size="medium">
			<form onSubmit={ onSubmit }>
				<VStack spacing={ 4 }>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Email or WordPress.com username' ) }
						placeholder={ __( 'team-member@example.com' ) }
						value={ login }
						help={ error || undefined }
						onChange={ ( value ) => {
							setLogin( value );
							setError( '' );
						} }
					/>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Message' ) }
						help={ __(
							'Optional: Include a custom message to provide more context to your team member.'
						) }
						value={ message }
						onChange={ setMessage }
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
