import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface RestoreDefaultARecordsProps {
	onConfirm: () => void;
	onCancel: () => void;
	isGravatarDomain: boolean;
	isOpen: boolean;
}

export default function RestoreDefaultARecords( {
	onConfirm,
	onCancel,
	isGravatarDomain,
	isOpen,
}: RestoreDefaultARecordsProps ) {
	const targetPlatformMessage = isGravatarDomain
		? __( 'Restoring the records will point this domain to your Gravatar profile.' )
		: __( 'Restoring the records will point this domain to your WordPress.com site' );
	return (
		<ConfirmDialog isOpen={ isOpen } onConfirm={ onConfirm } onCancel={ onCancel }>
			{ targetPlatformMessage }
		</ConfirmDialog>
	);
}
