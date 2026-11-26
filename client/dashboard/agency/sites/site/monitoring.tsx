import { agencySiteRoute } from '../../../app/router/agency';
import { SiteMonitoringContent } from '../../../app-dotcom/routes/sites/site/monitoring';

export default function AgencySiteMonitoring() {
	const { siteSlug } = agencySiteRoute.useParams();
	return <SiteMonitoringContent siteSlug={ siteSlug } />;
}
