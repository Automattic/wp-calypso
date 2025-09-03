import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';

interface RestoreDefaultEmailRecordsProps {
	onConfirm: () => void;
	onCancel: () => void;
	isOpen: boolean;
	isBusy: boolean;
}

export default function RestoreDefaultEmailRecords( {
	onConfirm,
	onCancel,
	isOpen,
	isBusy,
}: RestoreDefaultEmailRecordsProps ) {
	if ( ! isOpen ) {
		return null;
	}
	return (
		<Modal title={ __( 'Restore email records' ) } onRequestClose={ onCancel }>
			<VStack spacing={ 6 }>
				<Text>
					{ __( 'This will restore SPF, DKIM and DMARC records to their default configurations.' ) }
				</Text>
				<ButtonStack justify="flex-end">
					<Button onClick={ onCancel }>{ __( 'Cancel' ) }</Button>
					<Button variant="primary" isBusy={ isBusy } onClick={ onConfirm }>
						{ __( 'Restore' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
