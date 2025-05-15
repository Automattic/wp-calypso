import { sitePerformanceRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function SitePerformance() {
	return (
		<PageLayout>
			<PageHeader title={ sitePerformanceRoute.options.staticData.label() } />
		</PageLayout>
	);
}

export default SitePerformance;
