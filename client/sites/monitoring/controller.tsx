import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
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
