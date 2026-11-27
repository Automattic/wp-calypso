import { agencySiteRoute } from '../../../app/router/agency';
import { SitePerformanceContent } from '../../../app-dotcom/routes/sites/site/performance/layout';

export default function AgencySitePerformance() {
	const { siteSlug } = agencySiteRoute.useParams();
	return <SitePerformanceContent siteSlug={ siteSlug } />;
}
