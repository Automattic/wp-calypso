import { deleteLegacyContactMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import ConfirmModal from '../../components/confirm-modal';
import type { LegacyContact } from '@automattic/api-core';

interface RemoveContactDialogProps {
	contact: LegacyContact;
	isOpen: boolean;
	onClose: () => void;
}

export default function RemoveContactDialog( {
	contact,
	isOpen,
	onClose,
}: RemoveContactDialogProps ) {
	const mutation = useMutation(
		withSnackbar( deleteLegacyContactMutation(), {
			success: __( 'Legacy contact removed.' ),
			error: __( 'Failed to remove legacy contact.' ),
		} )
	);

	const handleRemove = () => {
		mutation.mutate( contact.legacy_contact_id, {
			onSuccess: () => {
				onClose();
			},
		} );
	};

	return (
		<ConfirmModal
			isOpen={ isOpen }
			// Keep the dialog in place while the request is in flight so the
			// confirmation UI can't be dismissed mid-removal.
			isDismissible={ ! mutation.isPending }
			confirmButtonProps={ {
				label: __( 'Remove' ),
				isBusy: mutation.isPending,
				disabled: mutation.isPending,
				isDestructive: true,
			} }
			onCancel={ onClose }
			onConfirm={ handleRemove }
		>
			{ __( 'Are you sure you want to remove your legacy contact?' ) }
		</ConfirmModal>
	);
}
