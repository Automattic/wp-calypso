import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function Notifications() {
	return (
		<PageLayout size="small">
			<PageHeader
				title={ __( 'Notifications' ) }
				description={ __( 'Manage your notification settings.' ) }
			/>
		</PageLayout>
	);
}

export default Notifications;
