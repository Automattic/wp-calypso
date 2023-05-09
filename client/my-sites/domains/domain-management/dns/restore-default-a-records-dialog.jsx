import { Dialog } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';

function RestoreDefaultARecordsDialog( { onClose, visible, defaultRecords } ) {
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

	const message = defaultRecords
		? sprintf(
				'We will remove all A & AAAA records and set the A records to our default: %s.',
				defaultRecords.join( ', ' )
		  )
		: __( 'We will remove all A & AAAA records and set the A records to our defaults.' );

	return (
		<Dialog isVisible={ visible } buttons={ buttons } onClose={ onCancel }>
			<h1>{ __( 'Restore default A records' ) }</h1>
			<p>{ __( 'Restoring the records will point this domain to your WordPress.com site.' ) }</p>
			<p className="restore-default-a-records-dialog__message">{ message }</p>
		</Dialog>
	);
}

export default RestoreDefaultARecordsDialog;
