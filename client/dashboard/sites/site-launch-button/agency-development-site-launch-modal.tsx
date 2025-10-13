import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';

interface AgencyDevelopmentSiteLaunchModalProps {
	isLaunching: boolean;
	onClose: () => void;
	onLaunch: () => void;
}

export default function AgencyDevelopmentSiteLaunchModal( {
	isLaunching,
	onClose,
	onLaunch,
}: AgencyDevelopmentSiteLaunchModalProps ) {
	return (
		<Modal title={ __( 'You’re about to launch this website' ) } onRequestClose={ onClose }>
			<VStack spacing={ 6 }>
				<Text as="p">
					{ __( 'After launch, we’ll bill your agency in the next billing cycle.' ) }
				</Text>
				<ButtonStack justify="flex-end">
					<Button disabled={ isLaunching } onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" isBusy={ isLaunching } onClick={ onLaunch }>
						{ __( 'Launch site' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
