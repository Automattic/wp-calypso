import { __ } from '@wordpress/i18n';
import PageLayout from '../../page-layout';

function MeNotifications() {
	return (
		<PageLayout
			title={ __( 'Notifications' ) }
			description={ __( 'Manage your notification settings.' ) }
		/>
	);
}

export default MeNotifications;
