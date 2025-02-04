import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';

function DismissEmailDnsIssuesDialog( { onClose, isVisible } ) {
	const { __ } = useI18n();

	const onAccept = () => {
		onClose( true );
	};

	const onCancel = () => {
		onClose( false );
	};

	const okCancelButtons = [
		{
			action: 'cancel',
			label: __( 'Cancel' ),
			onClick: onCancel,
		},
		{
			action: 'ok',
			label: __( 'OK' ),
			isPrimary: true,
			onClick: onAccept,
		},
	];

	return (
		<Dialog
			buttons={ okCancelButtons }
			className="import-bind-file-confirmation-dialog"
			onClose={ onCancel }
			isVisible={ isVisible }
		>
			<h1>{ __( 'Are you sure you want to ignore this issue?' ) }</h1>
			<p>
				{ __(
					"If you use this domain to send emails from your WordPress.com site and don't fix the DNS issues, your subscribers might not receive your emails."
				) }
			</p>
		</Dialog>
	);
}

export default DismissEmailDnsIssuesDialog;
