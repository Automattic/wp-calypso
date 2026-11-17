import { __ } from '@wordpress/i18n';
import ConfirmModal from '../../../components/confirm-modal';

interface ConfirmationModalProps {
	onCancel: () => void;
	onConfirm: () => void;
	isBusy: boolean;
	isOpen: boolean;
}

export const ConfirmationModal = ( {
	onCancel,
	onConfirm,
	isBusy,
	isOpen,
}: ConfirmationModalProps ) => {
	return (
		<ConfirmModal
			isOpen={ isOpen }
			title={ __( 'Pause all emails?' ) }
			onCancel={ onCancel }
			onConfirm={ onConfirm }
			confirmButtonProps={ { label: __( 'Yes, I want to pause all emails' ), isBusy } }
			cancelButtonText={ __( 'Cancel' ) }
			__experimentalHideHeader={ false }
			isDismissible={ false }
		>
			{ __( 'You won’t get updates from your newsletters while emails are paused.' ) }
		</ConfirmModal>
	);
};
