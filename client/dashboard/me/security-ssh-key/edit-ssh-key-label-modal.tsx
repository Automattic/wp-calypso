import { updateSshKeyLabelMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { SSH_KEY_LABEL_MAX_LENGTH } from '../../utils/ssh';
import type { UserSshKey } from '@automattic/api-core';

export default function EditSshKeyLabelModal( {
	sshKey,
	keyCount,
	onClose,
}: {
	sshKey: UserSshKey;
	keyCount: number;
	onClose: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const [ label, setLabel ] = useState( sshKey.label );

	const { mutate: updateSshKeyLabel, isPending } = useMutation(
		withSnackbar( updateSshKeyLabelMutation(), {
			success: __( 'SSH key label saved.' ),
			error: { source: 'server' },
		} )
	);

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		recordTracksEvent( 'calypso_dashboard_security_ssh_key_label_update_click', {
			key_count: keyCount,
		} );
		updateSshKeyLabel( { name: sshKey.name, label: label.trim() }, { onSuccess: onClose } );
	};

	return (
		<Modal title={ __( 'Edit SSH key label' ) } size="medium" onRequestClose={ onClose }>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<InputControl
						__next40pxDefaultSize
						label={ __( 'Label' ) }
						help={ __( 'Admins of sites this key is attached to can see its label.' ) }
						value={ label }
						onChange={ ( value ) => setLabel( value ?? '' ) }
						maxLength={ SSH_KEY_LABEL_MAX_LENGTH }
						disabled={ isPending }
					/>
					<ButtonStack justify="flex-end">
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							onClick={ onClose }
							disabled={ isPending }
						>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							type="submit"
							isBusy={ isPending }
							disabled={ isPending || ! label.trim() || label.trim() === sshKey.label }
						>
							{ __( 'Save' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
