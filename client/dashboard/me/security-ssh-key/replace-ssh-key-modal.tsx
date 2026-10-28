import { updateSshKeyMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Modal,
	Button,
	TextareaControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { isSshKeyValid } from '../../utils/ssh';
import { getInvalidSshKeyMessage, getSshKeyHelpText } from './messages';
import type { UserSshKey } from '@automattic/api-core';

export default function ReplaceSshKeyModal( {
	sshKey,
	keyCount,
	onClose,
}: {
	sshKey: UserSshKey;
	keyCount: number;
	onClose: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice } = useDispatch( noticesStore );
	const [ key, setKey ] = useState( '' );

	const { mutate: updateSshKey, isPending } = useMutation(
		withSnackbar( updateSshKeyMutation(), {
			success: __( 'SSH key saved.' ),
			error: { source: 'server' },
		} )
	);

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( ! isSshKeyValid( key.trim() ) ) {
			createErrorNotice( getInvalidSshKeyMessage(), { type: 'snackbar' } );
			return;
		}
		recordTracksEvent( 'calypso_dashboard_security_ssh_key_update_click', { key_count: keyCount } );
		updateSshKey( { name: sshKey.name, key: key.trim() }, { onSuccess: onClose } );
	};

	return (
		<Modal
			title={ sprintf(
				/* translators: %s is the SSH key label. */
				__( 'Replace SSH key “%s”' ),
				sshKey.label
			) }
			size="medium"
			onRequestClose={ onClose }
		>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<Text as="p">
						{ __(
							'The new key replaces the current one on all attached sites. The label stays the same.'
						) }
					</Text>
					<VStack spacing={ 1 }>
						<Text weight={ 500 }>{ __( 'Current key fingerprint' ) }</Text>
						<Text variant="muted" size="13px" style={ { wordBreak: 'break-all' } }>
							{ sshKey.sha256 }
						</Text>
					</VStack>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'New public SSH key' ) }
						help={ getSshKeyHelpText() }
						value={ key }
						onChange={ setKey }
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
							disabled={ isPending || ! key.trim() }
						>
							{ __( 'Replace key' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
