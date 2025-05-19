import { __ } from '@wordpress/i18n';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function SiteDeployments() {
	return (
		<PageLayout header={ <PageHeader title={ __( 'Deployments' ) } /> }>
			<DataViewsCard>
				<></>
			</DataViewsCard>
		</PageLayout>
	);
}

export default SiteDeployments;
