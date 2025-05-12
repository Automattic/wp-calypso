import { PageHeader } from '@automattic/components/src/page-header';
import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

function Notifications() {
	return (
		<PageLayout size="small">
			<PageHeader
				title={ __( 'Notifications' ) }
				description={ __( 'Manage your notification settings.' ) }
				level={ 1 }
			/>
		</PageLayout>
	);
}

export default Notifications;
