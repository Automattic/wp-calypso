import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function SiteDeployments() {
	return (
		<PageLayout>
			<PageHeader title={ __( 'Deployments' ) } />
		</PageLayout>
	);
}

export default SiteDeployments;
