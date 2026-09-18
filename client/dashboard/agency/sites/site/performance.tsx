import { agencySiteRoute } from '../../../app/router/agency';
import { SitePerformanceContent } from '../../../sites/performance';

export default function AgencySitePerformance() {
	const { siteSlug } = agencySiteRoute.useParams();
	return <SitePerformanceContent siteSlug={ siteSlug } />;
}
