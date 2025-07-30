import { isEnabled } from '@automattic/calypso-config';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getRouteFromContext } from 'calypso/utils';
import DashboardBackportSiteOverview from '../v2/site-overview';
import HostingOverview from './components/hosting-overview';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function overview( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker title="Sites > Overview" path={ getRouteFromContext( context ) } />
			<HostingOverview />
		</>
	);
	next();
}

/**
 * Backport Hosting Dashboard Site Overview page to the current one.
 */
export async function dashboardBackportSiteOverview( context: PageJSContext, next: () => void ) {
	const { site: siteSlug } = context.params;
	if ( ! isEnabled( 'dashboard/v2/backport/site-overview' ) ) {
		return overview( context, next );
	}

	// Route doesn't require a <PageViewTracker /> because the dashboard
	// fires its own page view events.
	context.primary = <DashboardBackportSiteOverview siteSlug={ siteSlug } />;

	next();
}
