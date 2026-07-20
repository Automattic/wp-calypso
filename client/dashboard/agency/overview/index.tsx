import { __ } from '@wordpress/i18n';
import FlashMessage from '../../components/flash-message';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function AgencyOverview() {
	return (
		<PageLayout header={ <PageHeader description="This is a sample overview page." /> }>
			<FlashMessage
				id="route-not-allowed"
				type="error"
				message={ __( 'You don’t have permission to view the requested page.' ) }
			/>
		</PageLayout>
	);
}
