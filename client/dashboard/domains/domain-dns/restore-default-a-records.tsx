import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';

interface RestoreDefaultARecordsProps {
	onConfirm: () => void;
	onCancel: () => void;
	isGravatarDomain: boolean;
	isOpen: boolean;
	isBusy: boolean;
}

export default function RestoreDefaultARecords( {
	onConfirm,
	onCancel,
	isGravatarDomain,
	isOpen,
	isBusy,
}: RestoreDefaultARecordsProps ) {
	if ( ! isOpen ) {
		return null;
	}
	const targetPlatformMessage = isGravatarDomain
		? __( 'Restoring the records will point this domain to your Gravatar profile.' )
		: __( 'Restoring the records will point this domain to your WordPress.com site' );
	return (
		<Modal title={ __( 'Restore A records' ) } onRequestClose={ onCancel }>
			<VStack spacing={ 6 }>
				<Text>{ targetPlatformMessage }</Text>
				<ButtonStack justify="flex-end">
					<Button __next40pxDefaultSize onClick={ onCancel } isBusy={ isBusy }>
						{ __( 'Cancel' ) }
					</Button>
					<Button __next40pxDefaultSize variant="primary" isBusy={ isBusy } onClick={ onConfirm }>
						{ __( 'Restore' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
