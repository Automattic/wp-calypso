import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import type { ResponseDomain } from 'calypso/lib/domains/types';

interface RestoreDefaultCnameRecordDialogProps {
	visible: boolean;
	onClose: ( result: { shouldRestoreDefaultRecords: boolean } ) => void;
	domain: ResponseDomain | undefined;
}

function RestoreDefaultCnameRecordDialog( {
	visible,
	onClose,
	domain,
}: RestoreDefaultCnameRecordDialogProps ) {
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

	const targetPlatformMessage = domain?.isGravatarDomain
		? __( 'Restoring the record will point the www subdomain to your Gravatar profile.' )
		: __( 'Restoring the record will point the www subdomain to your WordPress.com site.' );

	return (
		<Dialog isVisible={ visible } buttons={ buttons } onClose={ onCancel }>
			<h1>{ __( 'Restore default CNAME record' ) }</h1>
			<p>{ targetPlatformMessage }</p>
			<p className="restore-default-cname-record-dialog__message">
				{ __( 'In case a www CNAME record already exists, it will be deleted.' ) }
			</p>
		</Dialog>
	);
}

export default RestoreDefaultCnameRecordDialog;
