import { siteDeploymentsRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function SiteDeployments() {
	return (
		<PageLayout>
			<PageHeader title={ siteDeploymentsRoute.options.staticData.label() } />
		</PageLayout>
	);
}

export default SiteDeployments;
