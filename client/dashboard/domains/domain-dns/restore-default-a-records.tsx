import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

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
				<HStack justify="flex-end" spacing={ 2 }>
					<Button onClick={ onCancel } isBusy={ isBusy }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" isBusy={ isBusy } onClick={ onConfirm }>
						{ __( 'Restore' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
