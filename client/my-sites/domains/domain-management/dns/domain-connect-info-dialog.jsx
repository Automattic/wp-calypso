import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';

function DomainConnectInfoDialog( { onClose, visible } ) {
	const { __ } = useI18n();

	const buttons = [
		{
			action: 'cancel',
			label: __( 'Close' ),
		},
	];

	return (
		<Dialog isVisible={ visible } buttons={ buttons } onClose={ onClose }>
			<h1>{ __( 'Domain Connect TXT Record' ) }</h1>
			<p className="domain-connect-info-dialog__message">
				{ __(
					'This special record is used by some third parties to aid in automatically setting up services for use with your domain. If you need to use Domain Connect with your domain, make sure this record is enabled.'
				) }
			</p>
		</Dialog>
	);
}

export default DomainConnectInfoDialog;
