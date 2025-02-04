import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { SitePerformance } from './site-performance';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function sitePerformance( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker path="/sites/performance/:site" title="Site Performance" />
			<SitePerformance />
		</>
	);

	next();
}
