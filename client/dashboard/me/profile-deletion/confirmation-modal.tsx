import {
	Button,
	Modal,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

interface AccountDeletionConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	username: string;
	isDeleting: boolean;
}

export default function AccountDeletionConfirmModal( {
	isOpen,
	onClose,
	onConfirm,
	username,
	isDeleting,
}: AccountDeletionConfirmModalProps ) {
	const [ confirmText, setConfirmText ] = useState( '' );
	const isConfirmDisabled = confirmText !== username || isDeleting;

	// If not open, render nothing
	if ( ! isOpen ) {
		return null;
	}

	// Reset confirm text when modal closes
	const handleClose = () => {
		setConfirmText( '' );
		onClose();
	};

	return (
		<Modal
			title={ __( 'Confirm account deletion' ) }
			onRequestClose={ handleClose }
			className="account-deletion-confirm-modal"
		>
			<VStack spacing={ 4 }>
				<Text>
					{ __(
						'Please type your username in the field below to confirm. Your account will then be gone forever.'
					) }
				</Text>
				<TextControl
					label={ __( 'Type your username to confirm' ) }
					value={ confirmText }
					onChange={ setConfirmText }
					placeholder={ username }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<HStack justify="flex-end" spacing={ 2 }>
					<Button variant="tertiary" onClick={ handleClose } disabled={ isDeleting }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						isDestructive
						onClick={ onConfirm }
						disabled={ isConfirmDisabled }
						isBusy={ isDeleting }
					>
						{ isDeleting ? __( 'Deleting account…' ) : __( 'Delete account' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
