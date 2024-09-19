import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';

function RestoreDefaultemailRecordsDialog( { onClose, visible } ) {
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
			<h1>{ __( 'Restore default email authentication records' ) }</h1>
			<p>
				{ __( 'This will restore SPF, DKIM and DMARC records to their default configurations.' ) }
			</p>
		</Dialog>
	);
}

export default RestoreDefaultemailRecordsDialog;
