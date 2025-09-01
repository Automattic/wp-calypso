import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	Card,
	CardBody,
	Icon,
	Modal,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useAuth } from '../../app/auth';
import { closeAccountMutation } from '../../app/queries/me-account';
import ActionItem from '../../components/action-list/action-item';

interface AccountDeletionConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	username: string;
	isDeleting: boolean;
}

function AccountDeletionConfirmModal( {
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

export default function AccountDeletionSection() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const mutation = useMutation( closeAccountMutation() );

	// Ensure we have a username before rendering
	if ( ! user?.username ) {
		return null;
	}

	const handleDeleteClick = () => {
		setShowConfirmModal( true );
	};

	const handleConfirmDelete = () => {
		mutation.mutate( void 0, {
			onSuccess: () => {
				createSuccessNotice( __( 'Account deletion initiated.' ), { type: 'snackbar' } );
				navigate( {
					to: '/me/account/closed',
				} );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to delete account.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const handleCloseModal = () => {
		setShowConfirmModal( false );
	};

	return (
		<>
			<Card>
				<CardBody>
					<ActionItem
						actions={
							<Button
								disabled={ mutation.isPending }
								onClick={ handleDeleteClick }
								isDestructive
								variant="secondary"
								size="compact"
								style={ { minWidth: 'fit-content' } }
							>
								{ __( 'Delete account' ) }
							</Button>
						}
						decoration={ <Icon icon={ trash } size={ 24 } /> }
						description={ __( 'Delete all of your sites and close your account completely.' ) }
						title={ __( 'Delete your account permanently' ) }
					/>
				</CardBody>
			</Card>

			<AccountDeletionConfirmModal
				isOpen={ showConfirmModal }
				onClose={ handleCloseModal }
				onConfirm={ handleConfirmDelete }
				username={ user.username }
				isDeleting={ mutation.isPending }
			/>
		</>
	);
}
