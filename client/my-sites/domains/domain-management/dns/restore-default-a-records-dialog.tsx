import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import type { ResponseDomain } from 'calypso/lib/domains/types';

interface RestoreDefaultARecordsDialogProps {
	onClose: ( result: { shouldRestoreDefaultRecords: boolean } ) => void;
	visible: boolean;
	domain: ResponseDomain | undefined;
}

function RestoreDefaultARecordsDialog( {
	onClose,
	visible,
	domain,
}: RestoreDefaultARecordsDialogProps ) {
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

	const message = __(
		'We will remove all A & AAAA records and set the A records to our defaults.'
	);

	const targetPlatformMessage = domain?.isGravatarDomain
		? __( 'Restoring the records will point this domain to your Gravatar profile.' )
		: __( 'Restoring the records will point this domain to your WordPress.com site' );

	return (
		<Dialog isVisible={ visible } buttons={ buttons } onClose={ onCancel }>
			<h1>{ __( 'Restore default A records' ) }</h1>
			<p>{ targetPlatformMessage }</p>
			<p className="restore-default-a-records-dialog__message">{ message }</p>
		</Dialog>
	);
}

export default RestoreDefaultARecordsDialog;
