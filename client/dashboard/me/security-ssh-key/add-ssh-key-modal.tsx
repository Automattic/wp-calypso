import { createSshKeyMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Modal,
	Button,
	TextareaControl,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { getSshKeyComment, isSshKeyValid, SSH_KEY_LABEL_MAX_LENGTH } from '../../utils/ssh';
import { getInvalidSshKeyMessage, getSshKeyHelpText } from './messages';

export default function AddSshKeyModal( {
	keyCount,
	onClose,
}: {
	keyCount: number;
	onClose: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice } = useDispatch( noticesStore );

	const [ label, setLabel ] = useState( '' );
	const [ key, setKey ] = useState( '' );
	// Prefill the label from the key comment until the user types their own label.
	const [ isLabelPrefilled, setIsLabelPrefilled ] = useState( true );

	const { mutate: createSshKey, isPending } = useMutation(
		withSnackbar( createSshKeyMutation(), {
			success: __( 'SSH key added.' ),
			error: { source: 'server' },
		} )
	);

	const handleKeyChange = ( value: string ) => {
		setKey( value );
		if ( isLabelPrefilled ) {
			setLabel( getSshKeyComment( value ) );
		}
	};

	const handleLabelChange = ( value = '' ) => {
		setLabel( value );
		setIsLabelPrefilled( value === '' );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( ! isSshKeyValid( key.trim() ) ) {
			createErrorNotice( getInvalidSshKeyMessage(), { type: 'snackbar' } );
			return;
		}
		recordTracksEvent( 'calypso_dashboard_security_ssh_key_create_click', { key_count: keyCount } );
		createSshKey( { label: label.trim(), key: key.trim() }, { onSuccess: onClose } );
	};

	return (
		<Modal title={ __( 'Add SSH key' ) } size="medium" onRequestClose={ onClose }>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Public SSH key' ) }
						help={ getSshKeyHelpText() }
						value={ key }
						onChange={ handleKeyChange }
						disabled={ isPending }
					/>
					<InputControl
						__next40pxDefaultSize
						label={ __( 'Label' ) }
						help={ __(
							'A name to help you recognize this key. Admins of sites you attach the key to can see it.'
						) }
						value={ label }
						onChange={ handleLabelChange }
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
							disabled={ isPending || ! key.trim() || ! label.trim() }
						>
							{ __( 'Add SSH key' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</form>
		</Modal>
	);
}
