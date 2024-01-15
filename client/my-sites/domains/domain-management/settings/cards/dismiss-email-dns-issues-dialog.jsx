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
					"If you use this site to send emails and don't fix the email DNS issues, your subscribers might not receive emails correctly."
				) }
			</p>
		</Dialog>
	);
}

export default DismissEmailDnsIssuesDialog;
