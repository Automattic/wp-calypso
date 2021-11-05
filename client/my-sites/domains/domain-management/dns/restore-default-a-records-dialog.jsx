import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';

function RestoreDefaultARecordsDialog( { onClose, visible } ) {
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
			<h1>{ __( 'Restore default A records' ) }</h1>
			<p>{ __( 'Restoring the records will point this domain to your WordPress.com site.' ) }</p>
			<p>{ __( 'You currently have custom A records: 123.456.78.90, 123.456.78.92.' ) }</p>
			<p>{ __( 'We will change these to our default records: 192.0.78.24, 192.0.78.25.' ) }</p>
		</Dialog>
	);
}

export default RestoreDefaultARecordsDialog;
