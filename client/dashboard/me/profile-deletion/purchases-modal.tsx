import {
	Button,
	Modal,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import RouterLinkButton from '../../components/router-link-button';

interface PurchasesModalProps {
	onClose: () => void;
}

export default function PurchasesModal( { onClose }: PurchasesModalProps ) {
	return (
		<Modal title={ __( 'Delete account' ) } onRequestClose={ onClose }>
			<VStack spacing={ 6 }>
				<Text>{ __( 'You still have active purchases on your account.' ) }</Text>
				<Text>
					{ createInterpolateElement(
						__(
							'To delete your account, you‘ll need to <a>cancel any active purchases</a> before proceeding.'
						),
						{
							a: <RouterLinkButton variant="link" to="/me/billing/purchases" />,
						}
					) }
				</Text>
				<ButtonStack justify="flex-end">
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Back' ) }
					</Button>
					<RouterLinkButton variant="primary" to="/me/billing/purchases">
						{ __( 'Manage purchases' ) }
					</RouterLinkButton>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
