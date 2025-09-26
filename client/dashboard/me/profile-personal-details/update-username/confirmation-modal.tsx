import { __ } from '@wordpress/i18n';
import ConfirmModal from '../../../components/confirm-modal';

interface UsernameUpdateConfirmationModalProps {
	isOpen: boolean;
	currentUsername: string;
	onConfirm: () => void;
	onCancel: () => void;
	isBusy: boolean;
}

export default function UsernameUpdateConfirmationModal( {
	isOpen,
	currentUsername,
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
			{
				/* translators: %(username)s is the current username that will be changed */
				__(
					'You are about to change your username, {{strong}}%(username)s{{/strong}}. ' +
						'Once changed, you will not be able to revert it.'
				)
					.replace( '{{strong}}', '' )
					.replace( '{{/strong}}', '' )
					.replace( '%(username)s', currentUsername )
			}
		</ConfirmModal>
	);
}
