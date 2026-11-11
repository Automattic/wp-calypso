import { agencySiteRoute } from '../../../app/router/agency';
import { SiteMonitoringContent } from '../../../sites/monitoring';

export default function AgencySiteMonitoring() {
	const { siteSlug } = agencySiteRoute.useParams();
	return <SiteMonitoringContent siteSlug={ siteSlug } />;
}
