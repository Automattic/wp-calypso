import { DotcomFeatures } from '@automattic/api-core';
import { PerformanceCallout } from 'calypso/dashboard/sites/performance/performance-callout';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { hostingFeaturesCallout } from 'calypso/sites/hosting/controller';
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

export const sitePerformanceCallout = hostingFeaturesCallout(
	PerformanceCallout,
	DotcomFeatures.PERFORMANCE
);
