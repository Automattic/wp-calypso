import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../../components/button-stack';

interface Props {
	onCancel: () => void;
	onConfirm: () => void;
}

export const ConfirmationModal = ( { onCancel, onConfirm }: Props ) => {
	return (
		<Modal
			onRequestClose={ () => onCancel() }
			title={ __( 'Pause all emails?' ) }
			isDismissible={ false }
		>
			<VStack spacing={ 6 }>
				<Text>
					{ __( 'You won’t get updates from your newsletters while emails are paused.' ) }
				</Text>

				<ButtonStack justify="flex-end">
					<Button variant="tertiary" onClick={ () => onCancel() }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" onClick={ onConfirm }>
						{ __( 'Yes, I want to pause all emails' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
};
