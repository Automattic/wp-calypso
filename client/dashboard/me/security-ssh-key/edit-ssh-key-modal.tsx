import { updateSshKeyMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Modal,
	Button,
	TextareaControl,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { getSshKeyLabel, isSshKeyValid, SSH_KEY_LABEL_MAX_LENGTH } from '../../utils/ssh';
import { getInvalidSshKeyMessage, getSshKeyHelpText } from './messages';
import type { UserSshKey } from '@automattic/api-core';

export default function EditSshKeyModal( {
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

	const currentLabel = getSshKeyLabel( sshKey );
	const [ label, setLabel ] = useState( currentLabel );
	const [ key, setKey ] = useState( '' );

	const trimmedLabel = label.trim();
	const trimmedKey = key.trim();
	const isLabelChanged = trimmedLabel !== currentLabel;
	const isKeyChanged = trimmedKey !== '';

	const { mutate: updateSshKey, isPending } = useMutation(
		withSnackbar( updateSshKeyMutation(), {
			success: __( 'SSH key saved.' ),
			error: { source: 'server' },
		} )
	);

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( isKeyChanged && ! isSshKeyValid( trimmedKey ) ) {
			createErrorNotice( getInvalidSshKeyMessage(), { type: 'snackbar' } );
			return;
		}
		recordTracksEvent( 'calypso_dashboard_security_ssh_key_update_click', {
			key_count: keyCount,
			label_changed: isLabelChanged,
			key_changed: isKeyChanged,
		} );
		updateSshKey(
			{
				name: sshKey.name,
				...( isLabelChanged && { label: trimmedLabel } ),
				...( isKeyChanged && { key: trimmedKey } ),
			},
			{ onSuccess: onClose }
		);
	};

	return (
		<Modal title={ __( 'Edit SSH key' ) } size="medium" onRequestClose={ onClose }>
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
					<VStack spacing={ 1 }>
						<Text weight={ 500 }>{ __( 'Current key fingerprint' ) }</Text>
						<Text variant="muted" size="13px" style={ { wordBreak: 'break-all' } }>
							{ sshKey.sha256 }
						</Text>
					</VStack>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'New public SSH key (optional)' ) }
						help={ `${ __(
							'Leave empty to keep the current key. A new key replaces the current one on all attached sites.'
						) } ${ getSshKeyHelpText() }` }
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
							disabled={ isPending || ! trimmedLabel || ( ! isLabelChanged && ! isKeyChanged ) }
						>
							{ __( 'Save' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
