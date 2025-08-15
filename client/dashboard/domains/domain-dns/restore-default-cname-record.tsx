import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface RestoreDefaultCnameRecordProps {
	onConfirm: () => void;
	onCancel: () => void;
	isOpen: boolean;
	isBusy: boolean;
}

export default function RestoreDefaultCnameRecord( {
	onConfirm,
	onCancel,
	isOpen,
	isBusy,
}: RestoreDefaultCnameRecordProps ) {
	if ( ! isOpen ) {
		return null;
	}
	return (
		<Modal title={ __( 'Restore CNAME record' ) } onRequestClose={ onCancel }>
			<VStack spacing={ 6 }>
				<Text>{ __( 'In case a www CNAME record already exists, it will be deleted.' ) }</Text>
				<HStack justify="flex-end" spacing={ 2 }>
					<Button onClick={ onCancel }>{ __( 'Cancel' ) }</Button>
					<Button variant="primary" isBusy={ isBusy } onClick={ onConfirm }>
						{ __( 'Restore' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
