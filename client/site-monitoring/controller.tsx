import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { MetricsTab } from 'calypso/my-sites/site-monitoring/metrics-tab';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function siteMonitoring( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker path="/site-monitoring/:site" title="Site Monitoring" />
			<MetricsTab />
		</>
	);

	next();
}
