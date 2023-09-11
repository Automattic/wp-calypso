import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';

function RestoreDefaultCnameRecordDialog( { onClose, visible } ) {
	const { __ } = useI18n();

	const onRestore = () => {
		onClose( { shouldRestoreDefaultRecords: true } );
	};

	const onCancel = () => {
		onClose( { shouldRestoreDefaultRecords: false } );
	};

	const buttons = [
		{
			action: 'cancel',
			label: __( 'Cancel' ),
		},
		{
			action: 'restore',
			label: __( 'Restore' ),
			isPrimary: true,
			onClick: onRestore,
		},
	];

	return (
		<Dialog isVisible={ visible } buttons={ buttons } onClose={ onCancel }>
			<h1>{ __( 'Restore default CNAME record' ) }</h1>
			<p>
				{ __(
					'Restoring the record will create a www CNAME record pointing to your WordPress.com site.'
				) }
			</p>
			<p className="restore-default-cname-record-dialog__message">
				{ __( 'In case a www CNAME record already exists, it will be deleted.' ) }
			</p>
		</Dialog>
	);
}

export default RestoreDefaultCnameRecordDialog;
