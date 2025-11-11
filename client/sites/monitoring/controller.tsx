import { DotcomFeatures } from '@automattic/api-core';
import { MonitoringCallout } from 'calypso/dashboard/sites/monitoring/monitoring-callout';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { hostingFeaturesCallout } from 'calypso/sites/hosting/controller';
import { SiteMonitoring } from './components/site-monitoring';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function siteMonitoring( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker path="/site-monitoring/:site" title="Sites > Monitoring" />
			<SiteMonitoring />
		</>
	);

	next();
}

export const siteMonitoringCallout = hostingFeaturesCallout(
	MonitoringCallout,
	DotcomFeatures.MONITORING
);
