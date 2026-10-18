import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import ConfirmModal from '../../../components/confirm-modal';

interface UsernameUpdateConfirmationModalProps {
	isOpen: boolean;
	currentUsername: string;
	newUsername: string;
	onConfirm: () => void;
	onCancel: () => void;
	isBusy: boolean;
}

export default function UsernameUpdateConfirmationModal( {
	isOpen,
	currentUsername,
	newUsername,
	onConfirm,
	onCancel,
	isBusy,
}: UsernameUpdateConfirmationModalProps ) {
	if ( ! isOpen ) {
		return null;
	}

	return (
		<ConfirmModal
			isOpen={ isOpen }
			title={ __( 'Confirm username change?' ) }
			__experimentalHideHeader={ false }
			onConfirm={ onConfirm }
			onCancel={ onCancel }
			confirmButtonProps={ { label: __( 'OK' ), isBusy } }
			cancelButtonText={ __( 'Cancel' ) }
			isDismissible={ false }
		>
			{ createInterpolateElement(
				sprintf(
					/* translators: %(currentUsername)s is the current username that will be changed, %(newUsername)s is the new username */
					__(
						'You are about to change your username, <strong>%(currentUsername)s</strong>, to <strong>%(newUsername)s</strong>. <break/>This can’t be undone: <strong>%(currentUsername)s</strong> will be permanently abandoned and can’t be used again by anyone. <break/>Links to your old author pages and Reader profile will stop working, @mentions of your old username will no longer reach you, and your Gravatar and IntenseDebate profile addresses change.'
					),
					{ currentUsername, newUsername }
				),
				{
					strong: <strong />,
					break: <br />,
				}
			) }
		</ConfirmModal>
	);
}
