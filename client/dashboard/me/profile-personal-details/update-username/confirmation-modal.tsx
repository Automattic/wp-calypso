import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ConfirmModal from '../../../components/confirm-modal';
import { Text } from '../../../components/text';

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
			title={ __( 'Change your username?' ) }
			size="medium"
			__experimentalHideHeader={ false }
			onConfirm={ onConfirm }
			onCancel={ onCancel }
			confirmButtonProps={ { label: __( 'Change username' ), isBusy } }
			cancelButtonText={ __( 'Cancel' ) }
			isDismissible={ false }
		>
			<VStack spacing={ 3 }>
				<Text as="p">
					{ createInterpolateElement(
						__(
							'Your username will change from <currentUsername /> to <newUsername />. This can’t be undone.'
						),
						{
							currentUsername: <strong>{ currentUsername }</strong>,
							newUsername: <strong>{ newUsername }</strong>,
						}
					) }
				</Text>
				<Text as="p">{ __( 'What changes:' ) }</Text>
				<ul className="dashboard-username-change-list">
					<li>{ __( 'Links to your old author page and Reader profile stop working.' ) }</li>
					<li>{ __( '@mentions of your old username no longer reach you.' ) }</li>
					<li>{ __( 'Your Gravatar profile address changes.' ) }</li>
				</ul>
				<Text as="p" variant="muted">
					{ __(
						'If you only want to change the name people see, edit your display name instead.'
					) }
				</Text>
			</VStack>
		</ConfirmModal>
	);
}
