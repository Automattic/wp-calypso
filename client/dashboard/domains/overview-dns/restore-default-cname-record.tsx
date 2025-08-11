import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface RestoreDefaultCnameRecordProps {
	onConfirm: () => void;
	onCancel: () => void;
	isOpen: boolean;
}

export default function RestoreDefaultCnameRecord( {
	onConfirm,
	onCancel,
	isOpen,
}: RestoreDefaultCnameRecordProps ) {
	return (
		<ConfirmDialog isOpen={ isOpen } onConfirm={ onConfirm } onCancel={ onCancel }>
			{ __( 'In case a www CNAME record already exists, it will be deleted.' ) }
		</ConfirmDialog>
	);
}
