import { PageHeader } from '@automattic/components/src/page-header';
import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';

function SiteDeployments() {
	return (
		<PageLayout>
			<PageHeader title={ __( 'Deployments' ) } level={ 1 } />
		</PageLayout>
	);
}

export default SiteDeployments;
