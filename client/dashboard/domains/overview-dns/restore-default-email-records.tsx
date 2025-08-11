import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface RestoreDefaultEmailRecordsProps {
	onConfirm: () => void;
	onCancel: () => void;
	isOpen: boolean;
}

export default function RestoreDefaultEmailRecords( {
	onConfirm,
	onCancel,
	isOpen,
}: RestoreDefaultEmailRecordsProps ) {
	return (
		<ConfirmDialog isOpen={ isOpen } onConfirm={ onConfirm } onCancel={ onCancel }>
			{ __( 'This will restore SPF, DKIM and DMARC records to their default configurations.' ) }
		</ConfirmDialog>
	);
}
