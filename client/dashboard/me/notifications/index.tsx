import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

function Notifications() {
	return (
		<PageLayout
			title={ __( 'Notifications' ) }
			description={ __( 'Manage your notification settings.' ) }
			size="small"
		/>
	);
}

export default Notifications;
