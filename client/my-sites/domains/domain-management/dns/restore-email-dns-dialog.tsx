import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import type { RestoreEmailDnsDialogResult } from './types';

const RestoreEmailDnsDialog = ( {
	emailServiceName,
	isVisible,
	onClose,
}: {
	emailServiceName: string;
	isVisible: boolean;
	onClose: ( restoreEmailDnsDialogResult: RestoreEmailDnsDialogResult ) => void;
} ): JSX.Element => {
	const translate = useTranslate();

	const onCancel = () => {
		onClose( { shouldRestoreEmailDns: false } );
	};

	const onRestoreDns = () => {
		onClose( { shouldRestoreEmailDns: true } );
	};

	const buttons = [
		{
			action: 'cancel',
			label: translate( 'Cancel' ),
		},
		{
			action: 'restore',
			label: translate( 'Restore' ),
			isPrimary: true,
			onClick: onRestoreDns,
		},
	];

	return (
		<Dialog buttons={ buttons } isVisible={ isVisible } onClose={ onCancel }>
			<h1>
				{ translate( 'Restore DNS records for %(emailServiceName)s', {
					args: { emailServiceName },
					comment:
						"%(emailServiceName)s is the name of an email product, like 'Professional Email' or 'Email Forwarding'",
				} ) }
			</h1>

			<p>
				{ translate(
					'We will restore the DNS records for your %(emailServiceName)s email service.',
					{
						args: { emailServiceName },
						comment:
							"%(emailServiceName)s is the name of an email product, like 'Professional Email' or 'Email Forwarding'",
					}
				) }
			</p>
			<p>
				{ translate(
					'Restoring the DNS records will not affect any of your WordPress.com subscriptions, but the records will change where your email is being delivered.'
				) }
			</p>
		</Dialog>
	);
};

export default RestoreEmailDnsDialog;
