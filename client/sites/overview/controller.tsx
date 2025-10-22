import { isEnabled } from '@automattic/calypso-config';
import { isMigrationInProgress } from 'calypso/data/site-migration';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getRouteFromContext } from 'calypso/utils';
import DashboardBackportSiteOverview from '../v2/site-overview';
import HostingOverview from './components/hosting-overview';
import type { Context as PageJSContext } from '@automattic/calypso-router';
import type { SiteExcerptData } from '@automattic/sites';

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
	const site = getSelectedSite( context.store.getState() ) as SiteExcerptData;

	if ( isMigrationInProgress( site ) || context.query?.[ 'ssh-migration' ] === 'complete' ) {
		// Temporarily show the v1 site migration overview page.
		// @todo implement the page in v2.
		return overview( context, next );
	}

	if ( ! isEnabled( 'dashboard/v2/backport/site-overview' ) ) {
		return overview( context, next );
	}

	// Route doesn't require a <PageViewTracker /> because the dashboard
	// fires its own page view events.
	context.primary = <DashboardBackportSiteOverview siteSlug={ siteSlug } />;

	next();
}
