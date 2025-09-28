import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
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
			{ createInterpolateElement(
				sprintf(
					/* translators: %(username)s is the current username that will be changed */
					__(
						'You are about to change your username, <strong>%s</strong>. ' +
							'Once changed, you will not be able to revert it. <break />' +
							'Changing your username will also affect your Gravatar profile and IntenseDebate profile addresses.'
					),
					currentUsername
				),
				{
					strong: <strong />,
					break: <br />,
				}
			) }
		</ConfirmModal>
	);
}
